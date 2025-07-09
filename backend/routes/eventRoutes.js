import express from "express";
import cloudinary from "../config/cloudinary.js";
import Event from "../models/Event.js";
import { sendAlertEmail } from "../utils/nodemailer.js";

const router = express.Router();

// 📌 **Route: Upload Base64 Image**
router.post("/upload", async (req, res) => {

  try {
    const { image } = req.body; // Expecting Base64 string

    if (!image) return res.status(400).json({ error: "No image provided" });

    // Upload Base64 image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${image}`,
      {
        folder: "esp_events",
      }
    );

    // Save event in MongoDB
    const newEvent = await Event.create({
      imageUrl: uploadResponse.secure_url,
      timestamp: new Date()
    });
    await sendAlertEmail(uploadResponse.secure_url);

    res.json({
      message: "Event logged successfully!",
      cloudinaryUrl: uploadResponse.secure_url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 **Route: Fetch Events**
router.get("/logs", async (req, res) => {
  try {
    const logs = await Event.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
