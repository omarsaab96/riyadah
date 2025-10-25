// workers/paymentWorker.js
// This worker will process pending payments in the Payment collection
// and update user wallets accordingly.
// It runs every minute to ensure timely processing of payments.

import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { sendNotification } from '../utils/notificationService.js';

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('[paymentAuditor] Connected to MongoDB'))
    .catch(err => console.error('[paymentAuditor] MongoDB connection error:', err));

let isProcessing = false;

const processPendingPayments = async () => {
    if (isProcessing) {
        console.log('[paymentAuditor] Skipping run — still processing previous batch');
        return;
    }

    isProcessing = true;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const pendingPayments = await Payment.find({ status: 'pending' }).session(session);
        if (pendingPayments.length === 0) {
            console.log('[paymentAuditor] No pending payments.');
            return;
        }

        for (const payment of pendingPayments) {
            console.log(`[paymentAuditor] Processing payment ${payment._id}...`);

            const payerWallet = await Wallet.findOne({ user: payment.payer }).session(session);
            const beneficiaryWallet = await Wallet.findOne({ user: payment.beneficiary }).session(session);

            if (!payerWallet || payerWallet.availableBalance < payment.amount) {
                console.warn(`[paymentAuditor] No wallet or insufficient funds.`);
                payment.status = 'declined';
                await payment.save({ session });
                continue;
            }

            // Deduct from payer
            payerWallet.balance -= payment.amount;
            await payerWallet.save({ session });

            // Add to beneficiary
            beneficiaryWallet.availableBalance += payment.amount;
            await beneficiaryWallet.save({ session });

            // Mark payment completed
            payment.status = 'completed';
            payment.completedAt = new Date();
            await payment.save({ session });

            const payerUser = await User.findOne({ _id: payment.payer }).session(session).select('name');
            const beneficiaryUser = await User.findOne({ _id: payment.beneficiary }).session(session).select('_id expoPushToken');

            // Notify beneficiary
            await sendNotification(
                beneficiaryUser,
                '💰 Payment Received',
                `${payerUser.name} sent you ${payment.amount} ${payment.currency}.`
            );

            console.log(`[paymentAuditor] Marked completed.`);
        }

        await session.commitTransaction();
        console.log('[paymentAuditor] All pending payments processed successfully.');
    } catch (err) {
        console.error('[paymentAuditor] Worker error:', err);
        await session.abortTransaction();
    } finally {
        session.endSession();
        isProcessing = false;
    }
};

// Run every 1min (for testing)
setInterval(processPendingPayments, 60000);
console.log('[paymentAuditor] Worker started — checking every 1 min...');