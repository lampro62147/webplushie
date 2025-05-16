// Khởi tạo giỏ hàng từ localStorage hoặc tạo mới nếu chưa có
let cart = JSON.parse(localStorage.getItem('cart')) || {
    items: [],
    total: 0,
    count: 0
};

// Cập nhật hiển thị giỏ hàng
function updateCartDisplay() {
    // Cập nhật số lượng trên icon giỏ hàng (cho tất cả các trang)
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.count;
    }

    // Các phần tử chỉ có trong trang giỏ hàng
    const cartItemsContainer = document.querySelector('.cart-items');
    const itemCountElement = document.querySelector('.item-count');
    const totalAmountElement = document.querySelector('.total-amount');

    // Nếu đang ở trang giỏ hàng
    if (cartItemsContainer) {
        // Cập nhật số lượng sản phẩm
        if (itemCountElement) {
            itemCountElement.textContent = `${cart.count} Sản phẩm`;
        }

        // Cập nhật tổng tiền
        if (totalAmountElement) {
            totalAmountElement.textContent = formatPrice(cart.total);
        }

        // Cập nhật danh sách sản phẩm
        if (cart.items.length > 0) {
            cartItemsContainer.innerHTML = `
                <h2>Giỏ hàng:</h2>
                <div class="item-count">${cart.count} Sản phẩm</div>
                ${cart.items.map(item => `
                    <div class="cart-item">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="item-details">
                            <h3>${item.name}</h3>
                            <div class="item-price">
                                <span class="current-price">${formatPrice(item.price)}</span>
                            </div>
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" onclick="updateItemQuantity('${item.id}', -1)">−</button>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" 
                                    onchange="updateItemQuantity('${item.id}', this.value - ${item.quantity})">
                                <button class="quantity-btn plus" onclick="updateItemQuantity('${item.id}', 1)">+</button>
                            </div>
                            <button class="remove-item" onclick="removeItem('${item.id}')">Xóa</button>
                        </div>
                    </div>
                `).join('')}
            `;
        } else {
            cartItemsContainer.innerHTML = `
                <h2>Giỏ hàng:</h2>
                <div class="item-count">0 Sản phẩm</div>
                <p>Giỏ hàng của bạn đang trống</p>
            `;
        }
    }
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(event) {
    const productElement = event.target.closest('.product');
    const product = {
        id: Date.now(),
        name: productElement.querySelector('h3').textContent,
        price: parseInt(productElement.getAttribute('data-price')),
        image: productElement.querySelector('.main-image').src,
        quantity: 1
    };

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItem = cart.items.find(item => item.name === product.name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push(product);
    }

    // Cập nhật tổng số lượng và tổng tiền
    updateCartTotals();

    // Lưu giỏ hàng và hiển thị thông báo
    saveCart();
    showNotification('Sản phẩm đã được thêm vào giỏ hàng');
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateItemQuantity(itemId, change) {
    const item = cart.items.find(item => item.id.toString() === itemId.toString());
    if (item) {
        const newQuantity = item.quantity + (typeof change === 'number' ? change : parseInt(change));
        if (newQuantity > 0) {
            item.quantity = newQuantity;
            updateCartTotals();
            saveCart();
        } else {
            removeItem(itemId);
        }
    }
}

// Xóa sản phẩm khỏi giỏ hàng
function removeItem(itemId) {
    cart.items = cart.items.filter(item => item.id.toString() !== itemId.toString());
    updateCartTotals();
    saveCart();
}

// Cập nhật tổng số lượng và tổng tiền
function updateCartTotals() {
    cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Lưu giỏ hàng vào localStorage và cập nhật hiển thị
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Format giá tiền
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(price) + '₫';
}

// Hiển thị thông báo
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Thêm styles cho notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#ff6b6b';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';

    // Xóa notification sau 3 giây
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Sắp xếp sản phẩm
function sortProducts(sortType) {
    const productList = document.querySelector('.product-list');
    const products = Array.from(document.querySelectorAll('.product'));

    products.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price'));
        const priceB = parseInt(b.getAttribute('data-price'));

        if (sortType === 'low-to-high') {
            return priceA - priceB;
        } else if (sortType === 'high-to-low') {
            return priceB - priceA;
        }
        return 0;
    });

    productList.innerHTML = '';
    products.forEach(product => {
        productList.appendChild(product);
    });
}

// Lọc sản phẩm
function filterProducts() {
    const checkboxes = document.querySelectorAll('input[name="price-filter"]:checked');
    const products = document.querySelectorAll('.product');
    
    if (checkboxes.length === 0) {
        products.forEach(product => {
            product.style.display = 'block';
        });
        return;
    }

    const selectedRanges = Array.from(checkboxes).map(cb => cb.value);

    products.forEach(product => {
        const price = parseInt(product.getAttribute('data-price'));
        product.style.display = 'none';
        
        const shouldShow = selectedRanges.some(range => {
            if (range === '300000-500000') {
                return price >= 300000 && price <= 500000;
            } else if (range === '500000-1000000') {
                return price > 500000 && price <= 1000000;
            } else if (range === '1000000+') {
                return price > 1000000;
            }
            return false;
        });

        if (shouldShow) {
            product.style.display = 'block';
        }
    });
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật hiển thị giỏ hàng
    updateCartDisplay();

    // Thêm sự kiện cho các nút "Thêm vào giỏ" (chỉ ở trang chủ)
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    // Thêm sự kiện cho nút thanh toán (chỉ ở trang giỏ hàng)
    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            alert('Chức năng thanh toán đang được phát triển!');
        });
    }
});