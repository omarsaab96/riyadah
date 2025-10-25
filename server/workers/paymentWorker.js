// workers/paymentWorker.js
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const { sendNotification } = require('../utils/notificationService');

await mongoose.connect('mongodb+srv://omarsaab96:heBNAngdPP6paAHk@cluster0.goljzz8.mongodb.net/riyadahDB?retryWrites=true&w=majority&appName=Cluster0');

const processPendingPayments = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const pendingPayments = await Payment.find({ status: 'pending' }).session(session);
        if (pendingPayments.length === 0) {
            console.log('✅ No pending payments.');
            return;
        }

        for (const payment of pendingPayments) {
            console.log(`🔄 Processing payment ${payment._id}...`);

            const payerWallet = await Wallet.findOne({ user: payment.payer }).session(session);
            const beneficiaryWallet = await Wallet.findOne({ user: payment.beneficiary }).session(session);

            if (!payerWallet || payerWallet.availableBalance < payment.amount) {
                console.warn(`[FAIL] No wallet or insufficient funds.`);
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

            const payerUser = await UserActivation.findOne({ _id: payment.payer }).session(session).select('name');
            const beneficiaryUser = await UserActivation.findOne({ _id: payment.beneficiary }).session(session).select('_id expoPushToken');

            // Notify beneficiary
            await sendNotification(
                beneficiaryUser,
                '💰 Payment Received',
                `${payerUser.name} sent you ${payment.amount} ${payment.currency}.`
            );

            console.log(`[OK] Marked completed.`);
        }

        await session.commitTransaction();
        console.log('[DONE] All pending payments processed successfully.');
    } catch (err) {
        console.error('❌ Worker error:', err);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
};

// Run every 10 seconds (for testing)
setInterval(processPendingPayments, 10000);
