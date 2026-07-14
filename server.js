const express = require("express");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(session({
    secret:"beatsecret",
    resave:false,
    saveUninitialized:true
}));

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));


if(!fs.existsSync("data")){
    fs.mkdirSync("data");
}

if(!fs.existsSync("data/beats.json")){
    fs.writeFileSync("data/beats.json","[]");
}


const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        if(file.fieldname==="cover")
            cb(null,"uploads/covers");

        if(file.fieldname==="preview")
            cb(null,"uploads/previews");

        if(file.fieldname==="zip")
            cb(null,"uploads/zips");

    },

    filename:(req,file,cb)=>{
        cb(null,Date.now()+"-"+file.originalname);
    }

});


const upload = multer({storage});


function getBeats(){
    return JSON.parse(
        fs.readFileSync("data/beats.json")
    );
}


function saveBeats(data){
    fs.writeFileSync(
        "data/beats.json",
        JSON.stringify(data,null,2)
    );
}



app.get("/api/beats",(req,res)=>{
    res.json(getBeats());
});



app.post("/admin/login",(req,res)=>{

    if(req.body.password==="admin33"){
        req.session.admin=true;
        res.redirect("/admin.html");
    }
    else{
        res.send("Mot de passe incorrect");
    }

});



app.post(
"/admin/add",
upload.fields([
    {name:"cover"},
    {name:"preview"},
    {name:"zip"}
]),
(req,res)=>{


if(!req.session.admin)
return res.status(403).send("Non autorisé");


let beats=getBeats();


beats.push({

    id:Date.now(),

    title:req.body.title,

    cover:
    "/uploads/covers/"+req.files.cover[0].filename,

    preview:
    "/uploads/previews/"+req.files.preview[0].filename,

    zip:
    "/uploads/zips/"+req.files.zip[0].filename

});


saveBeats(beats);


res.redirect("/admin.html");


});



app.listen(3000,()=>{
console.log("Beat store lancé sur http://localhost:3000");
});
