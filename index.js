import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "database_name",
  password: "your_password",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/", async (req, res) => {
  const b = await db.query("SELECT * FROM items");
  console.log(b.rows); 
  const now = new Date();
  const options = { weekday: "long" }; 
  const listTitle = now.toLocaleDateString("en-US", options); 
  const options2 = { year: "numeric", month: "long", day: "numeric" }; 
  const listTitle2 = now.toLocaleDateString("en-US", options2);
  res.render("index.ejs", {
    listTitle: listTitle,
    listTitle2 : listTitle2,
    listItems: b.rows,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem.trim(); 

  if (!item) {
    console.log("Item is empty");
    return res.redirect("/?error=empty");
  }
  try {
    const check = await db.query("SELECT * FROM items WHERE title = $1", [item.lowerCase()]);
    if (check.rows.length > 0) {
      console.log("Item already exists");
      return res.redirect("/?error=duplicate");
    }
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (error) {
    console.log("error adding items!!");
    console.log(error);
    res.redirect("/?error=server");
  }
});


app.post("/edit", async(req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [title, id]);
    res.redirect("/");
  } catch (error) {
    console.log("error updating items!!");
    console.log(error);
  } 
});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = ($1)", [id]);
    res.redirect("/");
  } catch (error) {
    console.log("error deleting items!!");
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
