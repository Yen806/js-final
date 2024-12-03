const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const chartList = document.querySelector(".chartList")
let productData = {};

//顯示商品列表
function getProductList() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${apiPath}/products`)
        .then(response => {
            productData = response.data.products;
            displayProductList(productData);
        })
        .catch(error => {
            console.log(error.meassage);
        })
}

function displayProductList(productData) {
    let str = "";
    productData.forEach((item) => {
        str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}"
                    alt="">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${thousandth(item.origin_price)}</del>
                <p class="nowPrice">NT$${thousandth(item.price)}</p>
            </li>`;
    })
    productList.innerHTML = str;
}

function init() {
    getProductList();
    getChartList()
}
init();

//類別篩選
productSelect.addEventListener('change', (e) => {
    let newList = [];
    if (e.target.value === "全部") {
        displayProductList(productData);
        return;
    }
    productData.forEach((item) => {
        if (e.target.value === item.category) {
            newList.push(item);
        }
        displayProductList(newList);
    })
})

//我的購物車
let cartData = [];
const totalPrice = document.querySelector(".totalPrice")
function getChartList() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`)
        .then(response => {
            cartData = response.data.carts;
            let str = "";
            let total = 0;
            cartData.forEach((item) => {
                total += item.product.price * item.quantity;
                str += `<tr>
                        <td>
                            <div class="cardItem-title">
                                <img src="${item.product.images}" alt="">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${thousandth(item.product.price)}</td>
                        <td>${item.quantity}</td>
                        <td>NT$${thousandth(item.product.price * item.quantity)}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons js-deleteBtn" data-id="${item.id}">
                                clear
                            </a>
                        </td>
                    </tr>`
            })
            chartList.innerHTML = str;
            totalPrice.textContent = thousandth(total)
        })
        .catch(error => {
            console.log(error.meassage);
        })
}

//加入購物車
productList.addEventListener('click', (e) => {
    e.preventDefault();
    let addItemId = e.target.getAttribute("data-id");
    if (addItemId === undefined) {
        return;
    }
    let itemNum = 1;
    cartData.forEach((item) => {
        if (addItemId === item.product.id) {
            itemNum = item.quantity += 1
        }
    })
    axios.post(`${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`, {
        "data": {
            "productId": addItemId,
            "quantity": itemNum
        }
    })
        .then(response => {
            alert("加入購物車成功");
            getChartList()
        })
        .catch(error => {
            console.log(error.meassage);
        })
})


//刪除購物車單筆商品
chartList.addEventListener('click', (e) => {
    e.preventDefault();
    const deleteItemId = e.target.getAttribute("data-id");
    if (deleteItemId == null) {
        return;
    }
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${apiPath}/carts/${deleteItemId}`)
        .then(response => {
            alert("刪除品項成功");
            getChartList()
        })
        .catch((error) => {
            console.log(error.message);
        });
})

//刪除購物車
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    axios.delete(`${baseUrl}/api/livejs/v1/customer/${apiPath}/carts/`)
        .then(response => {
            alert("刪除購物車成功");
            getChartList()
        })
        .catch((error) => {
            alert("購物車是空的");
        });
})

const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const submit = document.querySelector(".orderInfo-btn");

submit.addEventListener('click', (e) => {
    e.preventDefault();
    if(cartData.length == 0){
        alert("購物車是空的");
        return;
    }
    if(customerName.value ==""||customerPhone.value ==""||customerEmail.value ==""||customerAddress.value ==""){
        alert("請輸入訂單資訊");
        return;
    }
    axios.post(`${baseUrl}/api/livejs/v1/customer/${apiPath}/orders`, {
        "data": {
            "user": {
                "name": customerName.value,
                "tel": customerPhone.value,
                "email": customerEmail.value,
                "address": customerAddress.value,
                "payment": tradeWay.value
            }
        }
    })
    .then(response =>{
        alert("送出訂單成功");
        getChartList();
        customerName.value = "";
        customerPhone.value = "";
        customerEmail.value = "";
        customerAddress.value = "";
        tradeWay.value = "ATM";
    })
    .catch((error) => {
        console.log(error.message);
    });
})

//utility
function thousandth(num) {
    let parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".");
}