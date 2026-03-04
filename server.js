const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/", (req,res)=>{
    res.send("SSC Score API running");
});

app.get("/score", async (req,res)=>{

    const url = req.query.url;

    if(!url){
        return res.json({error:"URL missing"});
    }

    try{

        const response = await axios.get(url,{
    headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121 Safari/537.36",
        "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language":"en-US,en;q=0.9",
        "Referer":"https://sscexams.cbexams.com/",
        "Connection":"keep-alive"
    },
    timeout:20000
});

        const html = response.data;

        const $ = cheerio.load(html);

        let correct = 0;
        let wrong = 0;
        let not_attempted = 0;

        $("td").each((i,el)=>{

            const bg = $(el).attr("bgcolor");

            if(bg==="green") correct++;
            if(bg==="red") wrong++;
            if(bg==="gray") not_attempted++;

        });

        const session1Correct = Math.min(correct,40);
        const session2Correct = Math.max(0,correct-40);

        const session1 = session1Correct * 3;
        const session2 = (session2Correct * 3) - wrong;

        const total = session1 + session2;

        res.json({
            correct,
            wrong,
            not_attempted,
            session1,
            session2,
            total
        });

    }catch(err){

        res.json({error:"Unable to fetch SSC page"});
    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server running on port "+PORT);
});
