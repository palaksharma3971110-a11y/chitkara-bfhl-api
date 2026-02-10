
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = "2311981368@chitkara.edu.in"; 


const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);


app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid request structure",
      });
    }

    const key = Object.keys(body)[0];
    const value = body[key];

    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value < 0) throw "Invalid Fibonacci input";
        let fib = [0, 1];
        for (let i = 2; i < value; i++) {
          fib.push(fib[i - 1] + fib[i - 2]);
        }
        data = fib.slice(0, value);
        break;

      case "prime":
        if (!Array.isArray(value)) throw "Invalid Prime input";
        data = value.filter((n) => Number.isInteger(n) && isPrime(n));
        break;

      case "lcm":
        if (!Array.isArray(value)) throw "Invalid LCM input";
        data = value.reduce((a, b) => lcm(a, b));
        break;

      case "hcf":
        if (!Array.isArray(value)) throw "Invalid HCF input";
        data = value.reduce((a, b) => gcd(a, b));
        break;

      case "AI":
        if (typeof value !== "string") throw "Invalid AI input";

        const geminiRes = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
            process.env.GEMINI_API_KEY,
          {
            contents: [{ parts: [{ text: value }] }],
          }
        );

        data =
          geminiRes.data.candidates[0].content.parts[0].text
            .split(" ")[0]
            .replace(/[^a-zA-Z]/g, "");
        break;

      default:
        throw "Invalid key";
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: data,
    });
  } catch (err) {
    res.status(500).json({
      is_success: false,
      message: err.toString(),
    });
  }
});


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
