const express = require("express");
const axios = require("axios");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - MUST BE PLACED BEFORE ROUTES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "miniProject_html.html"));
});

// =======================
// Nodemailer Setup
// =======================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("⚠️ Nodemailer Config Error:", error.message);
    } else {
        console.log("📧 Email server is ready to send messages.");
    }
});

// =======================
// Contact Form Route (POST)
// =======================
app.post("/api/contact", async (req, res) => {
    console.log("📩 Received contact form submission:", req.body);
    
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            message: "First Name, Email, and Message are required." 
        });
    }

    const mailOptions = {
        from: `"${firstName} ${lastName}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `📬 Portfolio Contact: ${firstName} ${lastName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #08111f;">
                <h2>New Portfolio Message</h2>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
                <hr />
                <h3>Message:</h3>
                <p style="background: #f4f7f9; padding: 15px; border-radius: 8px;">${message}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully!");
        res.status(200).json({ 
            success: true, 
            message: "Email sent successfully!" 
        });
    } catch (err) {
        console.error("❌ SendMail Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to send email." 
        });
    }
});

// =======================
// LeetCode API
// =======================
app.get("/api/leetcode", async (req, res) => {
    const username = "Amanpreet_0";

    const query = `
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
        userContestRanking(username: $username) {
            rating
        }
    }
    `;

    try {
        const response = await axios.post(
            "https://leetcode.com/graphql",
            { query, variables: { username } },
            { headers: { "Content-Type": "application/json" } }
        );

        const user = response.data.data.matchedUser;
        const contest = response.data.data.userContestRanking;

        if (!user) {
            return res.status(404).json({ message: "LeetCode user not found" });
        }

        let totalSolved = 0;
        user.submitStats.acSubmissionNum.forEach(item => {
            if (item.difficulty === "All") totalSolved = item.count;
        });

        res.json({
            totalSolved,
            contestRating: contest ? Math.round(contest.rating) : "Unrated"
        });
    } catch (err) {
        res.status(500).json({ message: "Unable to fetch LeetCode data" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});