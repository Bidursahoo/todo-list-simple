//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const app = express();
const _ = require("lodash")
const PORT = process.env.PORT

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



// mongoDB code collections
//mongoose.connect("mongodb://localhost:27017/")
mongoose.connect("mongodb+srv://bidursil:bidursilpass@cluster0.2yc0kyg.mongodb.net/todolistDB")
const itemSchema = new mongoose.Schema({
  name : {
    type : String,
    require: true,
  }
})
const Item = new mongoose.model("item" , itemSchema)
const item1 = new Item({
  name : "Buy Vegies"
}) 
const item2 = new Item({
  name : "Complete Mongoose Module"
}) 
const item3 = new Item({
  name : "Complete Dummy Project"
}) 






// function insert(value){
//   let temp = new Item({name: value});
//   temp.save().then(res=>{
//     console.log("saved")
//   })
  // Item.insertOne({name: value}).then(res=>{
  //   console.log("Inserted Some value")
  // }).catch(err=>{
  //   console.log("Errorrrrr YOU Bitchhhhh!!!!"+err)
  // })
// }

// Item.find({},{_id:0, name:1}).then(res=>{
//   res.forEach(element => {
//     items.push(element.name)
//   });
//   res.render("list", {listTitle: day, newListItems: items});
// })


//Custom Schema
const ListSchema = new mongoose.Schema({
  name : {
    type : String,
    require: true,
  },
  items: [itemSchema]

})
const List = mongoose.model("list",ListSchema)

const defaultItems = [item1 , item2,item3];



const day = date.getDay();





//Route Methods
app.get("/", function(req, res) {
  Item.find({}).then(result=>{
    if(result.length === 0 ){
      Item.insertMany(defaultItems).then(resu=>{
        // console.log("Insertion Done")
      })
      res.redirect("/");
    }else{
      // console.log(day)
      res.render("list", {listTitle: day, newListItems: result});
    }
  })

});




app.post("/", function(req, res){
  const item = req.body.newItem;
  const listName = req.body.list;
  let temp = new Item({name: item});
  if (listName === day){
    temp.save().then(result=>{
      console.log("saved");
      res.redirect("/");
    })
    
  }else{
    List.findOne({name: listName}).then(result=>{
      result.items.push(temp);
      result.save();
    })
    res.redirect("/"+listName);
  }  
  
});




app.post("/delete" , function(req,res){
  let checkedItem = req.body.checkbox;
  let arrItem = checkedItem.split(","); 
  if(arrItem[0] === day){
    console.log(arrItem[1]);
    Item.findByIdAndRemove({_id: arrItem[1]}).then(result => {
      console.log("Deleted One Item of id "+arrItem);
      res.redirect("/");
    })

  }else{
    List.findOneAndUpdate({name:arrItem[0]} , {$pull:{items: {_id: arrItem[1]}}}).then(
      result=>{
        console.log("Doen delete");
        res.redirect("/"+arrItem[0]);
      })
  }
})



//custom Route Method
app.get("/:customListName" , function(req , res){
  const customList = _.capitalize(req.params.customListName);
  List.findOne({name: customList}).then(result=>{
    if(result){
      console.log("Exist");
      res.render("list", {listTitle: result.name , newListItems : result.items});
    }else{
      const list = new List({
        name: customList,
        items: defaultItems
      })
      list.save();
      res.redirect("/"+customList)
    }
  }).catch(err=>{
    
  })
  
})




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});