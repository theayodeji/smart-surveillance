import fetch from 'node-fetch';

const base64Image = "/9j/4AAQSkZJRgABAQAAAQABAAD...";  // Use a real Base64 string

async function testUpload() {
    const response = await fetch("http://your-server-ip:5000/api/events/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image })
    });

    const data = await response.json();
    console.log(data);
}

testUpload();
