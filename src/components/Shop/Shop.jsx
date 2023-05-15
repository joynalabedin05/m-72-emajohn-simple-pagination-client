import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerpage,setItemsPerpage] = useState(10);
    // 1 done. determine the total number of pages
    // 2 TODO. decide the number of items per page
    // 3. calculate total pages
    // 4. determine the current page
    // 5. load appropriate data
    const {totalProducts}= useLoaderData();
    // console.log(totalProducts);
    // const itemsPerpage = 10; //TODO: make it dynamic
    const totalPages = Math.ceil(totalProducts/itemsPerpage);
    const pageNumbers = [...Array(totalPages).keys()];
    // console.log(totalProducts);
    
    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&limit=${itemsPerpage}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage,itemsPerpage]);

    useEffect(() => {
        const storedCart = getShoppingCart();
        const ids = Object.keys(storedCart);

        fetch('http://localhost:5000/productsById',{
            method: 'POST',
            headers:{
                'content-type':'application/json'
            },
            body:JSON.stringify(ids),
        })
        .then(res=>res.json())
        .then(cartProducts=>{
            // console.log('only products in the shopping cart',cartProducts);
            const savedCart = [];
            // step 1: get id of the addedProduct
            for (const id in storedCart) {
                // step 2: get product from products state by using id
                const addedProduct = cartProducts.find(product => product._id === id)
                if (addedProduct) {
                    // step 3: add quantity
                    const quantity = storedCart[id];
                    addedProduct.quantity = quantity;
                    // step 4: add the added product to the saved cart
                    savedCart.push(addedProduct);
                }
                // console.log('added Product', addedProduct)
            }
            // step 5: set the cart
            setCart(savedCart);
        })
   
    }, [])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    const options = [5,10,15,20];
    const handleSelectChange=(event)=>{
        setItemsPerpage(event.target.value);
        setCurrentPage(0)
    }

    return (
        <div>
            <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={cart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>
            </div>
            <div className='pagination'>
                
                <p>CurrentPage: {currentPage + 1} ItemsPerpage: {itemsPerpage}</p>
                {
                    pageNumbers.map(number=> <button 
                    onClick={()=>setCurrentPage(number)}
                    className={currentPage ===number? 'selected': ''}
                    key={number}
                    >{number + 1}</button> )
                }
                 <select value={itemsPerpage} onChange={handleSelectChange}>
                    {
                        options.map(option=><option key={option}
                        value={option}
                        >
                            {option}
                        </option> )
                    }
                </select>
            </div>
        </div>
    );
};

export default Shop;