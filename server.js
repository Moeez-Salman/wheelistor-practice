const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection configuration
const dbConfig = {
    user: "sa",
    password: "15092004",
    server: "localhost", 
    database: "WHEELISTER",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

// Connect to database
sql.connect(dbConfig)
    .then(() => console.log("Connected to SQL Server"))
    .catch(err => console.log("Database Connection Error:", err));

// Signup route using stored procedure
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("Username", sql.NVarChar, username)
            .input("Password", sql.NVarChar, password)
            .execute("RegisterUser"); // Calling the stored procedure

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("Username", sql.NVarChar, username)
            .input("Password", sql.NVarChar, password)
            .execute("CheckUserLogin"); // Call stored procedure

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        res.json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
app.post("/getuser", async (req, res) => {
    console.log("POST /getuser called");
    const { username } = req.body;
  
    if (!username) return res.status(400).json({ success: false, message: "Username required" });
  
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("Username", sql.NVarChar, username)
        .query("SELECT username, email, mobilenumber AS phone, location FROM Users WHERE username = @Username");
  
      if (result.recordset.length > 0) {
        res.json({ success: true, data: result.recordset });
      } else {
        res.json({ success: false, message: "User not found" });
      }
    } catch (error) {
      console.error("DB error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  
// Search user route
app.post("/search", async (req, res) => {
    const { username } = req.body;
    console.log("Received username:", username); // 🔍

    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        console.log("DB Connected ✅");

        const result = await pool
            .request()
            .input("Username", sql.NVarChar, username)
            .query("SELECT car_name, car_miles,car_booking_price FROM cars WHERE car_name LIKE '%' + @Username + '%'")


        console.log("Query Result:", result.recordset); // 🔍

        if (result.recordset.length > 0) {
            res.json({ success: true, data: result.recordset });
        } else {
            res.json({ success: false, message: "No users found." });
        }
    } catch (error) {
        console.error("Search Error:", error); // 🔥
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post("/getuser", async (req, res) => {
    console.log("POST /getuser called");
    const { username } = req.body;

    if (!username) return res.status(400).json({ success: false, message: "Username required" });

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("Username", sql.NVarChar, username)
            .query("SELECT username, email, mobilenumber AS phone, location FROM Users WHERE username = @Username");

        if (result.recordset.length > 0) {
            res.json({ success: true, data: result.recordset });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("DB error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    } finally {
        sql.close(); // Ensure the connection is closed
    }
});

// Assuming you are using Express and a MongoDB database
app.post("/updateuser", async (req, res) => {
    const { username, email, phone, location } = req.body;
  
    if (!username || !email || !phone || !location) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
  
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("Username", sql.NVarChar, username)
        .input("Email", sql.NVarChar, email)
        .input("MobileNumber", sql.NVarChar, phone)
        .input("Location", sql.NVarChar, location)
        .query(`
          UPDATE Users
          SET email = @Email, mobilenumber = @MobileNumber, location = @Location
          WHERE username = @Username
        `);
  
      if (result.rowsAffected[0] > 0) {
        res.json({ success: true, message: "User updated successfully." });
      } else {
        res.json({ success: false, message: "No user found or no changes made." });
      }
    } catch (error) {
      console.error("Update error:", error); // 🔥 log it
      res.status(500).json({ success: false, message: "Server error." });
    }
  });
  
  app.post("/search-warehouse", async (req, res) => {
    const { location } = req.body;

    if (!location) {
        return res.status(400).json({ success: false, message: "Location is required" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("Location", sql.NVarChar, location)
            .query("SELECT warehouse_no, warehouse_name, address,phonenumber FROM warehouse WHERE warehouse_name LIKE '%' + @Location + '%'");

        if (result.recordset.length > 0) {
            res.json({ success: true, data: result.recordset });
        } else {
            res.json({ success: false, message: "No warehouses found." });
        }
    } catch (error) {
        console.error("Warehouse Search Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


app.post("/book", async (req, res) => {
    console.log("Working");

    const {
        car_name,
        pickup_date,
        return_date,
        rental_period,
        pickup_location,
        total_price,
        username // Make sure this comes from frontend
    } = req.body;
console.log(username);
    if (!car_name || !pickup_date || !return_date || !pickup_location || !rental_period || !total_price || !username) {
        return res.status(400).json({ success: false, message: "All fields are required, including username and total price." });
    }

    try {
        const pool = await sql.connect(dbConfig);
        
        // Step 1: Get userID from users table using username
        const userResult = await pool
            .request()
            .input("Username", sql.NVarChar, username)
            .query("SELECT userID FROM users WHERE username = @Username");

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const userID = userResult.recordset[0].userID;
        console.log('User ID:', userID);
        // Step 2: Insert booking with userID
        const bookingResult = await pool
            .request()
            .input("UserID", sql.Int, userID)
            .input("CarName", sql.NVarChar, car_name)
            .input("PickupDate", sql.Date, pickup_date)
            .input("ReturnDate", sql.Date, return_date)
            .input("RentalPeriod", sql.NVarChar, rental_period)
            .input("PickupLocation", sql.NVarChar, pickup_location)
            .input("TotalPrice", sql.NVarChar, total_price)
            .query(`
                INSERT INTO car_bookings (userID, car_name, pickup_date, return_date, rental_period, pickup_location, booking_date, total_price)
                VALUES (@UserID, @CarName, @PickupDate, @ReturnDate, @RentalPeriod, @PickupLocation, GETDATE(), @TotalPrice);
                SELECT SCOPE_IDENTITY() AS BookingID;
            `);

        const bookingId = bookingResult.recordset[0].BookingID;

        res.status(201).json({
            success: true,
            message: `Booking for ${car_name} has been successfully created.`,
            booking_id: bookingId,
            user_id: userID,
            car_name,
            pickup_date,
            return_date,
            total_price,
            userID

        });

    } catch (error) {
        console.error("Error booking the car:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

app.get("/bookings", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .query("SELECT * from car_bookings");

        if (result.recordset.length > 0) {
            res.json({ success: true, data: result.recordset });
        } else {
            res.json({ success: false, message: "No bookings found." });
        }
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});