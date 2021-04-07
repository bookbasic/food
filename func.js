function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires// + ";path=/; domain=lookkit.co";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
$.fn.serializefiles = function () {
    var obj = $(this);
    /* ADD FILE TO PARAM AJAX */
    var formData = new FormData();
    $.each($(obj).find("input[type='file']"), function (i, tag) {
        $.each($(tag)[0].files, function (i, file) {
            formData.append(tag.name, file);
        });
    });
    var params = $(obj).serializeArray();
    $.each(params, function (i, val) {
        if (val.name == '_id' && val.value == '') { }
        else formData.append(val.name, val.value);
    });
    return formData;
};
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
        if (this.name == '_id' && this.value == '') o[this.name] = null;
    });
    return o;
};
$.fn.serializeOrder = function () {
    var obj = $(this);
    var o = {};
    var a = this.serializeArray();
    var nums = $(obj).find("input[name='order-num[]']")
    o['total'] = $('.ttp')[1].value;
    $.each($('.payment'), function (index, item) {
        if (item.checked) o['payment'] = item.value;
    })
    //o['shop'] = shop[cur_shop];
    o['shop'] = shop[cur_shop].name;
    o['order'] = [];
    for (var i = 0; i < nums.length; i++)
        if (nums[i].value > 0)
            o['order'].push({ 'name': nums[i].getAttribute('i-name'), 'price': nums[i].getAttribute('i-price') * nums[i].value, 'num': nums[i].value });
    if (cur_shop.length == 0) return null;
    if (o['order'].length == 0) return null;
    return o;
};
function order_submit(event) {
    if (event) event.preventDefault();
    var dat = $('#order-form').serializeOrder();
    console.log(dat)
    $.ajax({
        type: (dat._id == null ? "POST" : "PUT"),
        url: '/api/order',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(dat),
    }).done(function (response) {
        $('#order-form')[0].reset();
    });
}
var cur_id;
function category_open(id) {
    //$.ajax({
    //    type: "GET",
    //    url: '/api/category/' + id
    //}).done(function (response) {
    $('#category-form')[0].reset();
    $('#category-modal').modal();
    $('#category-id').val(id);
    if (category[id]) {
        cur_id = id;
        $('#category-name').val(category[id].name);
        $('#category-del').show();
    } else $('#category-del').hide();
    //});
}
function category_del() {
    $.ajax({
        type: "DELETE",
        url: '/api/category/' + cur_id
    }).done(function (response) {
        var tmp = $(window).scrollTop()
        alldata()
        $('#category-modal').modal('hide');
        $(window).scrollTop(tmp)
        return false;
    });
}

function category_submit() {
    var dat = $('#category-form').serializeObject();
    $.ajax({
        type: (dat._id == null ? "POST" : "PUT"),
        url: '/api/category',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(dat),
    }).done(function (response) {
        var tmp = $(window).scrollTop()
        alldata()
        $('#category-modal').modal('hide');
        $(window).scrollTop(tmp)
        return false;
    });
}
function product_open(category_id, id = '') {
    $('#product-form')[0].reset();
    $('#product-modal').modal();
    $('#product-id').val(id);
    $('#product-category_id').val(category_id);
    if (product[id]) {
        cur_id = id;
        $('#product-name').val(product[id].name);
        $('#product-price').val(product[id].price);
        $('#product-del').show();
    } else $('#product-del').hide();

}
function product_del() {
    $.ajax({
        type: "DELETE",
        url: '/api/product/' + cur_id
    }).done(function (response) {
        var tmp = $(window).scrollTop()
        alldata()
        $('#product-modal').modal('hide');
        $(window).scrollTop(tmp)
        return false;
    });
}

function product_submit(event) {
    if (event) event.preventDefault();
    var dat = $('#product-form').serializefiles();
    console.log(dat.get('_id'));
    $.ajax({
        type: (dat.get('_id') == null ? "POST" : "PUT"),
        url: '/api/product',
        //enctype: 'multipart/form-data',
        //        data: JSON.stringify($('#category-form').serializeObject()),
        //        dataType: 'json',
        //        contentType: 'application/json',
        //        data: new FormData($('#category-form')),
        data: $('#product-form').serializefiles(),
        processData: false,
        contentType: false
    }).done(function (response) {
        var tmp = $(window).scrollTop()
        alldata()
        $('#product-modal').modal('hide');
        $(window).scrollTop(tmp)
    });
}
var category, product;
function alldata() {
    $.ajax({
        type: "GET",
        url: '/api/alldata'
    }).done(function (response) {
        category = [];
        product = [];
        $('#alldata').html('');
        $.each(response.data, function (index, item) {
            console.log(item)
            category[item._id] = item;
            $('#alldata').append('<div class=mt-2><span class="float-left m-1">' + item.name + '</span>\
            <span class="bi-pencil-fill bg-primary rounded-circle px-2 py-1 cat-edit setup" onclick=category_open("' + item._id + '")></span>\
            </div>\
            <div class=w-100 style="overflow:auto">\
            <table style="table-layout:fixed" width='+ ((item.products.length * 160) + 160) + 'px>\
            <tbody id='+ item._id + '>\
            </table>');
            $.each(item.products, function (index2, item2) {
                product[item2._id] = item2;
                $('#' + item._id).append('<td width=160px>\
                <div class="card rounded product mr-2">\
                <div class="row no-gutters pt-1">\
                    <span class="pl-2 text-truncate col-9">' + item2.name + '</span>\
                    <span class="bi-pencil-fill bg-primary rounded-circle px-2 py-1 prod-edit setup" onclick=product_open("' + item._id + '","' + item2._id + '")></span>\
                    <div class="text-center col-12">\
                        <img class="prod-img m-1" src="/'+ item2.path + '" width=100% >\
                        <span class="px-3 py-1" style=font-size:18px onclick=sub(this)>-</span>\
                        <input name=order-num[] i-name="'+ item2.name + '" i-price="' + item2.price + '" class="border-0 text-center ord" style="width:40px;height:32px" value=0>\
                        <span class="px-3 py-1" style=font-size:18px onclick=add(this)>+</span>\
                    </div>\
                </div>\
                </div>');
            });
            $('#' + item._id).append('<td width=100% class=pointer onclick=product_open("' + item._id + '")>\
            <div class="card rounded product txtlarge text-center align-middle p-3 row no-gutters setup">\
            <div class=col-12>เพิ่มเมนู<span class="rounded-circle bg-primary bi-plus px-1" style="font-size:44px;color:#fff;"></span></div>\
            </div>');
        });
    });
}
function sub(obj) {
    if ($(obj).next().val() == '0') return;
    $(obj).next().val($(obj).next().val() * 1 - 1);
    var sum = 0;
    $.each($('.ord'), function (index, item) {
        sum += $(item).attr('i-price') * item.value
    })
    $('.ttp').val(sum)
}
function add(obj) {
    $(obj).prev().val($(obj).prev().val() * 1 + 1);
    var sum = 0;
    $.each($('.ord'), function (index, item) {
        sum += $(item).attr('i-price') * item.value
    })
    $('.ttp').val(sum)
}
function shop_open(id = '') {
    $('#shop-form')[0].reset();
    $('#shop-modal').modal();
    $('#shop-id').val(id);
    if (shop[id]) {
        cur_id = id;
        $('#shop-name').val(shop[id].name);
        $('#shop-del').show();
    } else $('#shop-del').hide();
}
function shop_del() {
    $.ajax({
        type: "DELETE",
        url: '/api/shop/' + cur_id
    }).done(function (response) {
        var tmp = $(window).scrollTop()
        allshop()
        $('#shop-modal').modal('hide');
        $(window).scrollTop(tmp)
        return false;
    });
}

function shop_submit(event) {
    if (event) event.preventDefault();
    var dat = $('#shop-form').serializefiles();
    console.log(dat.get('_id'));
    $.ajax({
        type: (dat.get('_id') == null ? "POST" : "PUT"),
        url: '/api/shop',
        data: $('#shop-form').serializefiles(),
        processData: false,
        contentType: false
    }).done(function (response) {
        var tmp = $(window).scrollTop()
        allshop()
        $('#shop-modal').modal('hide');
        $(window).scrollTop(tmp)
    });
}
var shop, cur_shop = '';
function allshop() {
    $.ajax({
        type: "GET",
        url: '/api/allshop'
    }).done(function (response) {
        shop = [];
        $('#allshop').html('<table style="table-layout:fixed" width=' + ((response.data.length * 66) + 66) + '><tbody id=allshopbody></table>');
        $.each(response.data, function (index2, item2) {
            shop[item2._id] = item2;//<span class=p-1>' + item2.name + '</span>\
            $('#allshopbody').append('<td width=66px>\
            <span class="bi-pencil-fill bg-primary rounded-circle px-2 py-1 shop-edit setup" onclick=shop_open("' + item2._id + '")></span>\
            <div class="selshop p-1" i-id=' + item2._id + ' i-name=' + item2.name + ' onclick=sel(this)>\
            <div class="shop text-right" style="background:url(\'/'+ item2.path + '\')"></div>\
            </div>');
        });
        $('#allshopbody').append('<td width=100%>\
            <div class="card rounded shop text-center align-middle pointer p-1 m-2 setup" onclick=shop_open()>\
            <span class="rounded-circle bi-plus" style="padding:0px 2px;background:#007bff;font-size:26px;color:#fff;"></span></div>');
    });
}
function sel(obj) {
    cur_shop = $(obj).attr('i-id');
    $('.selshop').removeClass('border');
    $(obj).addClass('border border-primary');
}
$().ready(function () {
    alldata()
    allshop()
})