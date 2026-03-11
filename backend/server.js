// --- [1. นำเข้า Library] ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task'); // ตรวจสอบว่าชื่อไฟล์ Task.js ถูกต้อง
require('dotenv').config();
 
const app = express();
 
// --- [2. Middlewares - ลำดับตรงนี้สำคัญมาก] ---
app.use(cors());           // อนุญาตให้ Frontend ติดต่อได้
app.use(express.json());   // *** ต้องอยู่ก่อน Routes เพื่อให้อ่าน Body (JSON) ได้ ***
 
// --- [3. เชื่อมต่อ MongoDB] ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected..."))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));
 
// --- [4. API Endpoints] ---
 
// [GET] ดึงรายการงานทั้งหมด
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });
  }
});
 
// [POST] เพิ่มงานใหม่ - แก้ปัญหา Error 400
app.post('/tasks', async (req, res) => {
  // Debug: ดูข้อมูลที่ส่งมาจาก Frontend ผ่านหน้าจอ Terminal ของ Backend
  console.log("ข้อมูลที่ได้รับจาก Frontend:", req.body);
 
  // ตรวจสอบเบื้องต้นว่ามีฟิลด์ 'text' ส่งมาไหม
  if (!req.body.text) {
    return res.status(400).json({ error: "กรุณาส่งฟิลด์ 'text' มาให้ถูกต้อง" });
  }
 
  try {
    const newTask = new Task({
      text: req.body.text,    // ใช้ค่า text จาก Body
      completed: false        // กำหนดค่าเริ่มต้นเป็น false
    });
 
    const savedTask = await newTask.save();
    console.log("บันทึกสำเร็จ:", savedTask);
    res.status(201).json(savedTask); // ส่งข้อมูลที่บันทึกสำเร็จกลับไป
  } catch (err) {
    console.error("บันทึกไม่สำเร็จ:", err.message);
    res.status(400).json({ error: err.message });
  }
});
 
// [PUT] Toggle Status (ขีดฆ่า/แก้กลับ)
app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "ไม่พบรายการนี้" });
 
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: "อัปเดตสถานะล้มเหลว" });
  }
});
 
// [DELETE] ลบรายการ
app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "ลบสำเร็จ" });
  } catch (err) {
    res.status(400).json({ error: "ลบล้มเหลว" });
  }
});
 
// --- [5. Start Server] ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server รันที่ http://localhost:${PORT}`);
});