let orderData = [];
const orderList = document.querySelector(".orderList");
const header = {
    headers: {
        'Authorization': token,
    }
}

const init = () => {
    getOrderList();
}
init();

function getOrderList() {
    axios.get(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders`, header)
        .then((response) => {
            orderData = response.data.orders;
            let str = "";
            orderData.forEach((item) =>{
                //產品字串
                let productStr = "";
                item.products.forEach((productItem) => {
                    productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
                });
                //訂單狀態
                let orderState = "";
                if (!item.paid) {
                    orderState = "未處理";
                } else if (item.paid) {
                    orderState = "已處理";
                }
                //組訂單日期
                const setTime = new Date(item.createdAt * 1000);
                const orderTime = `${setTime.getFullYear()}/${setTime.getMonth() + 1}/${setTime.getDate()}`
                //訂單字串全部
                str += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                            ${productStr}
                        </td>
                        <td>${orderTime}</td>
                        <td class="orderStatus">
                            <a href="#" data-status="${item.paid}" data-id="${item.id}" class="js-orderStatus">${orderState}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                        </td>
                    </tr>`

            })
            orderList.innerHTML = str;
            renderC3();
        })
        .catch((error) => {
            console.log(error.message);
        });
}

orderList.addEventListener('click', (e) => {
    e.preventDefault();
    let id = e.target.getAttribute("data-id");
    const getClass = e.target.getAttribute("class");
    if (getClass == "js-orderStatus") {
        let status = e.target.getAttribute("data-status");
        changeOrderState(status, id);
        return;
    };
    if (getClass == "delSingleOrder-Btn js-orderDelete") {
        deleteOrder(id);
        return;
    }
})

function changeOrderState(status, id) {
    let newStatus;
    if (status == true) {
        newStatus = false;
    } else{
        newStatus = true;
    }

    axios.put(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders`,
        {
            "data": {
                "id": id,
                "paid": newStatus
            }
        }, header)
        .then((response) => {
            alert("修改成功");
            getOrderList();
        })
        .catch((error) => {
            console.log(error.message);
        });
}

function deleteOrder(id) {
    axios.delete(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders/${id}`, header)
        .then((response) => {
            alert("刪除訂單成功");
            getOrderList();
        })
        .catch((error) => {
            console.log(error.message);
        });
}

function deleteAllOrder() {
    const discardAllBtn = document.querySelector(".discardAllBtn");
    discardAllBtn.addEventListener('click',  (e) => {
        e.preventDefault();
        axios.delete(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders/`, header)
            .then((response) =>{
                alert("刪除全部訂單成功");
                getOrderList();
            })
            .catch((error) =>{
                console.log(error.message);
            });
    })

}

let newData = [];
const renderC3 = () => {
    let total = {};
    orderData.forEach((item) =>{
        item.products.forEach( (productItem) => {
            if (!total[productItem.title]) {
                total[productItem.title] = productItem.price * productItem.quantity;
            } else {
                total[productItem.title] += productItem.price * productItem.quantity;
            }
        })
        newData = Object.entries(total);
    })

    newData.sort((a, b) =>{
        return b[1] - a[1]
    })

    if (newData.length > 3) {
        let otherTotal = 0;
        newData.forEach((item, index) =>{
            if (index > 2) {
                otherTotal += newData[index][1];
            }
        })
        newData.splice(3, newData.length - 1);
        newData.push(["其他", otherTotal]);
    }
    // C3.js
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