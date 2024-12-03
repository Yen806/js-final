const orderList = document.querySelector(".orderList");
let orderData = [];

function getOrderList() {
    axios.get(`${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`, header)
        .then(response => {
            orderData = response.data.orders;
            renderData(orderData)
        })
        .catch(error => {
            console.log(error.meassage);
        })
}

function renderData(orderData) {
    let str = "";

    orderData.forEach((item) => {
        let itemStr = "";
        item.products.forEach((productItem) => {
            itemStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        })
        let itemStatus = "";
        if (item.paid) {
            itemStatus = "已處理";
        } else if (!item.paid) {
            itemStatus = "未處理";
        }

        //時間換算
        const setTime = new Date(item.createdAt * 1000);
        const orderTime = `${setTime.getFullYear()}/${setTime.getMonth() + 1}/${setTime.getDate()}`
        //表單內容
        str += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>${itemStr}</td>
                        <td>${orderTime}</td>
                        <td class="orderStatus">
                            <a href="#" class="js-status" data-status="${item.paid}" data-id="${item.id}">${itemStatus}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
                        </td>
                    </tr>`
    })
    orderList.innerHTML = str;
    renderC3();
    
}

orderList.addEventListener('click', (e) => {
    e.preventDefault();
    const getClass = e.target.getAttribute("class");
    const id = e.target.getAttribute("data-id");
    const status = e.target.getAttribute("data-status")
    if (getClass === "js-status") {
        changeState(status, id);
        return

    } else if (getClass === "delSingleOrder-Btn") {
        deleteOreder(id);
        return
    }
})

//訂單狀態
function changeState(status, id) {
    let newStatus;
    if (status === true) {
        newStatus = false;
    } else {
        newStatus = true;
    }

    axios.put(`${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, header)
        .then(response => {
            alert("修改狀態成功");
            getOrderList()
        })
}
//刪除訂單
function deleteOreder(id) {
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${apiPath}/orders/${id}`, header)
        .then(response => {
            alert("刪除訂單成功");
            getOrderList()
        })
}

//清除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${apiPath}/orders/`, header)
        .then(response => {
            alert("清除全部訂單成功");
            getOrderList()
        })
})

function init() {
    getOrderList();
}
init();

let newData = [];
function renderC3() {
    let aryPrice = {};
    orderData.forEach((item) => {
        item.products.forEach((productItem) => {
            if (!aryPrice[productItem.title]) {
                aryPrice[productItem.title] = productItem.price * productItem.quantity;
            } else{
                aryPrice[productItem.title] += productItem.price * productItem.quantity;
            }
        })
        newData = Object.entries(aryPrice);
    })

    newData.sort((a,b) =>{
        return b[1] - a[1];
    })

    if (newData.length > 3){
        let elseTotal = 0;
        newData.forEach((item,index)=>{
            if(index >2){
                elseTotal += newData[index][1]
            }
        })
        newData.splice(3, newData.length-1)
        newData.push(["其他", elseTotal])
    }

    // // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
        },
        color: {
            pattern: ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF']
        },
    });
}
