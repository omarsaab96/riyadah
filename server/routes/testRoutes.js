const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const User = require("../models/User");

// ─────────────────────────────────────────
// GET A USER'S Test
// GET /test/user/:userId
// ─────────────────────────────────────────
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const test = await Test.findOne({ testedSubject: userId });

        if (!test) {
            return res.json({ message: "No test found for this user", test: null });
        }

        res.json({ test });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// ─────────────────────────────────────────
// ADD SKILL RESULT
// POST /test/add-result/:userId
// ─────────────────────────────────────────
router.post("/add-result/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { testData } = req.body;

        console.log("Received testData:", testData);

        if (!testData) {
            return res.status(400).json({ message: "testData is required" });
        }

        // find or create
        let test = await Test.findOne({ testedSubject: userId });

        if (!test) {
            test = await Test.create({
                testedSubject: testData.testedSubject,
                lastTested: testData.lastTested,
                results: []
            });
        }

        testData.results.forEach(r => {
            test.results.push({
                testedSkill: r.testedSkill,
                score: r.score,
                date: r.date || new Date()
            });
        });

        test.lastTested = testData.lastTested;

        await test.save();

        res.json({ message: "Result added", test });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// ─────────────────────────────────────────
// GET ALL SKILL DOCUMENTS (ADMIN)
// GET /skills/all
// ─────────────────────────────────────────
router.get("/all", async (req, res) => {
    try {
        const skills = await Skill.find().populate("testedSubject", "firstname lastname email photo");

        res.json({ skills });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// ─────────────────────────────────────────
// DELETE SKILL DOCUMENT
// DELETE /skills/:id
// ─────────────────────────────────────────
// router.delete("/:id", async (req, res) => {
//     try {
//         const deleted = await Skill.findByIdAndDelete(req.params.id);

//         if (!deleted) {
//             return res.status(404).json({ message: "Skill not found" });
//         }

//         res.json({ message: "Skill deleted" });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

module.exports = router;
