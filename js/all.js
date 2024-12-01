const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const shoppingCartItem = document.querySelector(".shoppingCart-item");
const discardAll = document.querySelector(".discardAllBtn");
let data = [];



const getProductList = () => {
    axios.get(`${baseUrl}api/livejs/v1/customer/${apiPath}/products`)
        .then((response) => {
            data = response.data.products;
            renderProductList(data);
        })
        .catch((error) =>{
            console.log(error.message);
        });
}

const init= () => {
    getProductList();
    getCartList();
}
init();

const renderProductList = (data) =>{
    let str = "";
    data.forEach((item) => {
        str += `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${thousandth(item.origin_price)}</del>
            <p class="nowPrice">NT$${thousandth(item.price)}</p>
        </li>`;
    })
    productWrap.innerHTML = str;
}

productSelect.addEventListener('change',(e) =>{
    let category = e.target.value;
    let filterData = [];
    if (category === "全部") {
        renderProductList(data);
        return;
    }
    data.forEach((item) => {
        if (category === item.category) {
            filterData.push(item);
        }
        renderProductList(filterData);
    });
})

productWrap.addEventListener('click',  (e) => {
    e.preventDefault();
    let addCardClass = e.target.getAttribute("class");
    if (addCardClass !== "addCardBtn") {
        return;
    }
    let productId = e.target.getAttribute("data-id");
    let itemNum = 1;
    cartData.forEach((item) => {
        if (item.product.id === productId) {
            itemNum = item.quantity += 1;
        }
    })
    axios.post(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`, {
        "data": {
            "productId": productId,
            "quantity": itemNum
        }

    })
        .then((response) => {
            alert("加入購物車成功")
            getCartList();
        })
        .catch((error) => {
            console.log(error.message);
        });

})

function getCartList() {
    axios.get(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`)
        .then((response) => {
            cartData = response.data.carts;
            const totalPrice = document.querySelector(".totalPrice")
            totalPrice.textContent = thousandth(response.data.finalTotal);
            let str = '';
            cartData.forEach((item) => {
                str += `<tr>
                            <td>
                                <div class="cardItem-title">
                                    <img src="${item.product.images}" alt="">
                                    <p>${item.product.title}</p>
                                </div>
                            </td>
                            <td>NT$${thousandth(item.product.price)}</td>
                            <td>${item.quantity}</td>
                            <td>NT$${thousandth(item.quantity * item.product.price)}</td>
                            <td class="discardBtn">
                                <a href="#" class="material-icons" data-id="${item.id}">
                                    clear
                                </a>
                            </td>
                        </tr>`
            })
            shoppingCartItem.innerHTML = str;
        })
        .catch((error) => {
            console.log(error.message);
        });
}

//刪除單筆
shoppingCartItem.addEventListener('click', (e) => {
    e.preventDefault();
    let cartId = e.target.getAttribute("data-id");
    if (cartId == null) {
        return;
    }
    console.log(cartId);
    axios.delete(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts/${cartId}`)
        .then((response) => {
            alert("刪除品項成功");
            getCartList();
        })
        .catch((error) => {
            console.log(error.message);
        });
})

//刪除全部
discardAll.addEventListener('click',  (e) => {
    e.preventDefault();
    axios.delete(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`)
        .then((response) =>{
            alert("刪除全部購物車成功");
            getCartList();
        })
        .catch(function () {
            alert("購物車已經是空的了")
        })
})

//送出訂單
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    if (cartData.length == 0) {
        alert("購物車是空的");
        return;
    }
    if (customerName.value == "" || customerPhone.value == "" || customerEmail.value == "" || customerAddress.value == "" || tradeWay.value == "") {
        alert("請輸入訂單資訊");
        return;
    }
    axios.post(`${baseUrl}api/livejs/v1/customer/${apiPath}/orders`, {
        "data": {
            "user": {
                "name": customerName.value.trim(),
                "tel": customerPhone.value.trim(),
                "email": customerEmail.value.trim(),
                "address": customerAddress.value.trim(),
                "payment": tradeWay.value.trim()
            }
        }
    })
        .then((response) =>{
            alert("訂單建立成功");
            getCartList();
            customerName.value = "";
            customerPhone.value = "";
            customerEmail.value = "";
            customerAddress.value = "";
            tradeWay.value = "ATM"
        })
        .catch((error) => {
            console.log(error.message);
        });

})

function thousandth(num) {
    let parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".");
}