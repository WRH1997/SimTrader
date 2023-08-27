import React from "react";
import { useNavigate } from "react-router-dom";
import BuyStockForm from "./BuyStockForm"
import Popup from 'reactjs-popup';
import Logout from './Logout';
//import 'reactjs-popup/dist/index.css';



export default function PortfolioView(){

    const nav = useNavigate();

    const [portfolio, setPortfolio] = React.useState();
    const [balance, setBalance] = React.useState();
 
    React.useEffect(() => {
        const getPortfolio = async () => {
            let username = localStorage.user;
            if(localStorage.viewPort==null || localStorage.viewPort ==undefined){
                nav('/homepage');
            }
            let targetPort = localStorage.viewPort;
            let data = await fetch(process.env.REACT_APP_API_GATEWAY +'/portfolios/userportfolios', {
                method: 'POST',
                body: JSON.stringify({"username": username, "viewPort":targetPort})
            });
            let res = await data.json();
            let portfolio = res['body'];
            let balance = portfolio['balance'];
            setBalance(balance);
            delete portfolio['balance'];
            setPortfolio(portfolio);
        }
        getPortfolio();
    }, [])

    React.useEffect(() => {}, portfolio);


    const BackToAll = () => {
        nav('/homepage');
    }


    const quoteTargetStock = async (stock) => {
        let data = await fetch(process.env.REACT_APP_API_GATEWAY +'/marketdata/stockquote', {
            method: 'POST',
            body: JSON.stringify({"ticker": stock})
        });
        let res = await data.json();
        let quote = res["body"]["price"];
        return quote;
    }

    const sell = async (event) => {
        event.preventDefault();
        let stock = event.target.id;
        let username = localStorage.user;
        let targetPortfolio = localStorage.viewPort;

        let quote = await quoteTargetStock(stock);
        console.log(quote);

        let quantity = parseInt(document.getElementById(stock+"q").value);
        console.log(quantity);

        let data2 = await fetch(process.env.REACT_APP_API_GATEWAY +'/portfolios/sell', {
            method: 'POST',
            body: JSON.stringify({
                "username": username,
                "portfolioName": targetPortfolio,
                "ticker": stock,
                "quote": quote,
                "quantity": quantity
            })
        });
        let res2 = await data2.json();

        if(res2["statusCode"]!=200){
            console.log(res2);
            alert("Error trying to sell stock [" + stock + "]!");
            return;
        }

        alert("Successfully sold [" + quantity + "] of [" + stock + "]!");
        window.location.reload(); 
    }


    return(
        <div className='port-view-div'>
            <center>
                <br></br>
                <h2><i>{localStorage.viewPort}</i> Portfolio</h2>
                {Object.keys(portfolio || {})?.map((key, i) => (
                    <div className='single-port'>
                        Stock: <b>{key}</b>
                        <br></br><br></br>
                        Current Quantity: <b>{portfolio[key]}</b>
                        <br></br><br></br>
                        <input type='number' id={key+'q'} defaultValue={1}></input>
                        &nbsp;&nbsp;&nbsp;
                        <input type='button' id={key} onClick={sell} value='Sell' className='sell-quant'></input>
                    </div>
                ))}
                <div className='port-balance'>
                    <i>Current Balance: <b>${balance}</b></i>
                </div>
                <br></br><br></br>
                <Popup trigger={<button className="buy-stock-btn"> Buy Stock</button>} position="top center">
                    <BuyStockForm username={localStorage.user} portfolio={localStorage.viewPort}/>
                </Popup>
                <input type='button' value='Back to All Portfolios' onClick={BackToAll} className='back-to-all'></input>
            </center>
            <Logout/>
        </div>
    )
}

