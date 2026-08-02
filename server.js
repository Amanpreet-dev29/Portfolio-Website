// Force Node.js to prioritize IPv4 globally before any network calls happen
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

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
// Nodemailer Setup (HARDCODED IPv4 FOR RENDER)
// =======================
const transporter = nodemailer.createTransport({
    host: "142.250.152.108", // Direct IPv4 for smtp.gmail.com (Bypasses Render IPv6 resolution)
    port: 587,
    secure: false, // TLS via STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false,
        servername: "smtp.gmail.com" // Required so TLS matches Gmail's SSL certificate
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

        const stats = user.submitStats.acSubmissionNum;
        const totalSolved = stats.find(s => s.difficulty === "All")?.count || 0;
        const easySolved = stats.find(s => s.difficulty === "Easy")?.count || 0;
        const mediumSolved = stats.find(s => s.difficulty === "Medium")?.count || 0;
        const hardSolved = stats.find(s => s.difficulty === "Hard")?.count || 0;
        const rating = contest ? Math.round(contest.rating) : "N/A";

        res.json({
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            rating
        });
    } catch (error) {
        console.error("❌ LeetCode API Error:", error.message);
        res.status(500).json({ message: "Failed to fetch LeetCode stats" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
      
   
