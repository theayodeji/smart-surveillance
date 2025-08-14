import express from "express";
import cloudinary from "../config/cloudinary.js";
import Event from "../models/Event.js";
import { sendAlertEmail } from "../utils/nodemailer.js";
import User from "../models/User.js";

const router = express.Router();

// 📌 **Route: Upload Base64 Image**
router.post("/upload", async (req, res) => {

  console.log("Motion was detected on your property! \nProcessing...");
  const adminUser = await User.findOne({ username: "admin" });
  const alertEmail = adminUser?.alertEmail || adminUser?.email;
  const isEmailAlertEnabled = adminUser?.emailAlerts;

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
    if (isEmailAlertEnabled) {
      await sendAlertEmail(uploadResponse.secure_url, alertEmail);
    }

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

// 📌 **Route: Fetch All Events**
router.get("/logs", async (req, res) => {
  try {
    const logs = await Event.find().sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});

// 📌 **Route: Fetch Single Event by ID**
router.get("/logs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 **Route: Bulk Delete Events**
router.delete("/bulk", async (req, res) => {
  try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: "An array of event IDs is required" });
      }

      // First, get the events to delete so we can clean up Cloudinary
      const eventsToDelete = await Event.find({ _id: { $in: ids } });
      
      if (eventsToDelete.length === 0) {
          return res.status(404).json({ error: "No events found to delete" });
      }

      // Delete images from Cloudinary
      for (const event of eventsToDelete) {
          const publicId = event.imageUrl.split('/').slice(-1)[0].split('.')[0];
          try {
              await cloudinary.uploader.destroy(`esp_events/${publicId}`);
          } catch (error) {
              console.error('Error deleting image from Cloudinary:', error);
              // Continue with deletion even if Cloudinary deletion fails
          }
      }

      // Delete events from database
      const result = await Event.deleteMany({ _id: { $in: ids } });

      res.json({ 
          message: `Successfully deleted ${result.deletedCount} events`,
          deletedCount: result.deletedCount
      });
  } catch (error) {
      console.error('Error deleting events:', error);
      res.status(500).json({ error: "Failed to delete events" });
  }
});

// 📌 **Route: Delete Event by ID**
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Optionally, delete the image from Cloudinary
    // Extract public_id from imageUrl if you want to delete from Cloudinary
    const publicId = event.imageUrl.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(`esp_events/${publicId}`);

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});


export default router;