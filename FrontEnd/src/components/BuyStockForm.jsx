import React from "react";
import { useNavigate } from "react-router-dom";


export default function BuyStockForm(props){

    const [options, setOptions] = React.useState([]);
    const [quote, setQuote] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [loading2, setLoading2] = React.useState(false);


    const searchTicker = async () => {
        setLoading(true);
        let searchTerm = document.getElementById("ticker").value;
        if(searchTerm==""){
            alert("Error: Search Term is blank!");
            return;
        }

        let data = await fetch(process.env.REACT_APP_API_GATEWAY +'/marketdata/tickersearch', {
            method: 'POST',
            body: JSON.stringify({"searchTerm": searchTerm})
        });
        let res = await data.json();
        let tickers = res["body"]["bestMatches"];

        let optionList = [];
        for(let x=0; x<tickers.length; x++){
            let symbol = tickers[x]["1. symbol"];
            optionList.push(symbol);
        }
        setLoading(false);
        setOptions(optionList);
    }


    const buyStock = async (label, quote) => {
        let quantity = document.getElementById('quantity').value;
        quote = Math.round(quote * 100) / 100;
        let data = await fetch(process.env.REACT_APP_API_GATEWAY +'/portfolios/buy', {
            method: 'POST',
            body: JSON.stringify({
                "username": props.username,
                "portfolioName": props.portfolio,
                "ticker": label,
                "quote": quote,
                "quantity": quantity
            })
        });
        let res = await data.json();
        console.log(res["statusCode"]);
        if(res["statusCode"]!=200){
            alert(res["error"]+"\n"+res["errorMessage"]);
            return;
        }
        alert("You have successfully purchased [" + quantity + "] of [" + label + "]!");
        window.location.reload(); 
    }


    const getStockQuote = async (event) => {
        setLoading2(true);
        event.preventDefault();
        let data = await fetch(process.env.REACT_APP_API_GATEWAY +'/marketdata/stockquote', {
            method: 'POST',
            body: JSON.stringify({"ticker": event.target.id})
        });
        let res = await data.json();
        let quote = res["body"]["price"];
        let label = event.target.id;
        //setQuote([label, quote]);
        let quoteDiv = <div className='quote-div'>
            <u>Stock:</u> <b><span id='stockLabel'>{label}</span></b>
            <br></br>
            <u>Price Per Unit:</u> <b><span id='stockQuote'>${quote}</span></b>
            <br></br><br></br>
            Quantity: <input type='number' id='quantity' defaultValue={1}></input>
            <br></br>
            <center>
                <input type='button' value='Buy' onClick={()=>buyStock(label, quote)} className='buy-form-btn'></input>
            </center>
            <br></br>
        </div>
        setLoading2(false);
        setQuote(quoteDiv);
    }


    React.useEffect(()=>{}, options)

    React.useEffect(()=>{}, [quote]);

    React.useEffect(()=>{}, loading);



    return(
        <div className='stock-form'>
            Ticker: <input type='text' className='ticker' id='ticker'></input>  
            <br></br>
            <input type='button' value='Search Ticker' onClick={searchTicker} className='sr-btn'></input>
            <br></br> 
            {loading ? <div>  Loading...</div> : null}
            <div id='options'>
                {options?.map((option) => (
                    <div onClick={getStockQuote} id={option} className='buy-options'>
                        {option}
                    </div>
                ))}
            </div>
            <br></br>
            {loading2 ? <div>  Loading...</div> : null}
            <div id='quote'>
                    {quote}
            </div>
        </div>
        
    )
}