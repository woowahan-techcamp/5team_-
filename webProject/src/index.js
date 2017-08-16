import "./firebaseinit.js"
import "./ranking.js"
import "./brand.js"
import "./productDetail.js"
import "./index.css"
import "../style/productDetail.css"
import "../style/brand.css"
import "../style/ranking.css"

document.addEventListener('DOMContentLoaded', function (event) {
    const searchParams = {
      brand: '.fixTab-search-brand',
      brand_dropdown: '.fixTab-search-brand-dropdown',
      category: '.fixTab-search-category',
      category_drowndown: '.fixTab-search-category-dropdown',
      text: '.fixTab-search-word',
      button: '.fixTab-search-button'
    }

    new SearchTab(searchParams);

    const profileDrop = document.querySelector('.fixTab-profile-id');

    profileDrop.addEventListener("mouseover",function(){
        const dropdown = document.querySelector((".fixTab-profile-dropdown"));
        if(dropdown.style.display === "block"){

        }else{
            dropdown.style.display = "block";
        }
    });

    profileDrop.addEventListener("mouseout",function(){
        const dropdown = document.querySelector((".fixTab-profile-dropdown"));

        if(dropdown.style.display === "block"){
            dropdown.style.display = "none";
        }
    });

    const carousel = new Carousel('reviewNavi','carousel-leftButton',
        'carousel-rightButton', 10, 'carousel-template','carouselSec');
    const counter = new Counter(3000);
    counter.setCounter();

});

class SearchTab{
  constructor(searchParams){
    this.brandDrop = document.querySelector(searchParams.brand);
    this.brandNavi = document.querySelector(searchParams.brand_dropdown);
    this.categoryDrop = document.querySelector(searchParams.category);
    this.categoryNavi = document.querySelector(searchParams.category_drowndown);

    this.inputText = document.querySelector(searchParams.text);
    this.searchButton = document.querySelector(searchParams.button);

    this.init();
  }

  init(){
    this.dropdownEvent();
  }

  dropdownEvent(){
    this.brandDrop.addEventListener("click",function () {
        const dropdown = document.querySelector((".fixTab-search-brand-dropdown"));

        if(dropdown.style.display === "block"){
            dropdown.style.display = "none";
        }else{
            dropdown.style.display = "block";
        }
    });

    this.brandNavi.addEventListener("click",function (event) {
        this.brandDrop.firstChild.innerText = event.toElement.innerText;
    }.bind(this));

    this.categoryDrop.addEventListener("click",function () {
        const dropdown = document.querySelector((".fixTab-search-category-dropdown"));

        if(dropdown.style.display === "block"){
            dropdown.style.display = "none";
        }else{
            dropdown.style.display = "block";
        }
    });

    this.categoryNavi.addEventListener("click",function (event) {
        this.categoryDrop.firstChild.innerText = event.toElement.innerText;
    }.bind(this));

    this.searchButton.addEventListener("click",function(){
      if(this.inputText.value === ''){
        console.log('검색어 입력 하셈;;');
      }else{
        this.setQuery();
      }
    }.bind(this));
  }

  setQuery(){
    const queryBrand = this.brandDrop.firstChild.innerText;
    const queryCategory = this.categoryDrop.firstChild.innerText;

    let brand;
    switch (queryBrand) {
      case 'GS25':
        brand = 'gs25';
        break;
      case '7ELEVEN':
        brand = '7-eleven'
        break;
      case 'CU':
        brand = 'CU';
        break;
      default:
        brand = '';
        break;
    }

    const category = (queryCategory === '카테고리') ? '' : queryCategory;
    const text = this.inputText.value;

    const product = localStorage['product'];
    const object = JSON.parse(product);

    this.setFilterSearchData(brand, category, text, object);
  }

  setFilterSearchData(brand, category, text, object){
    const value = [];
    console.log(brand, category, text);
    for(const key in object){
      if(brand === ''){
        if(category === ''){
          if((object[key].name).match(text)){
            value.push(object[key]);
          }
        } else{
          if(object[key].category === category){
            if((object[key].name).match(text)){
              value.push(object[key]);
            }
          }
        }
      } else{
        if(object[key].brand === brand){
          if(category === ''){
            if((object[key].name).match(text)){
              value.push(object[key]);
            }
          } else{
            if(object[key].category === category){
              if((object[key].name).match(text)){
                value.push(object[key]);
              }
            }
          }
        }
      }
    }

    console.log(value);
  }

}


class Util {

    ajax(func) {
        const oReq = new XMLHttpRequest();
        oReq.addEventListener('load', function (e) {
            const data = JSON.parse(oReq.responseText);
            func.setData(data);
        });

        oReq.open('GET', func.url);
        oReq.send();
    }

    template(data,template,section){
        const context = data;
        const tmpl = Handlebars.compile(template);
        section.innerHTML = tmpl(context);
    }
}

class Carousel {

    constructor(reviewNavi,leftButton, rightButton, count, template, sec) {
        this.reviewNavi = reviewNavi;
        this.leftButton = leftButton;
        this.rightButton = rightButton;
        this.count = count;
        this.template = template;
        this.sec = sec;
        this.data = [];
        this.index = 0;
        this.init();
    }

    init(){
        this.leftButton = document.getElementById(this.leftButton);
        this.rightButton = document.getElementById(this.rightButton);
        this.template = document.getElementById(this.template).innerHTML;
        this.sec = document.getElementById(this.sec);
        this.leftButton.addEventListener("click",function(){
            this.beforePage();
        }.bind(this));
        this.rightButton.addEventListener("click",function(){
            this.nextPage();
        }.bind(this));
        this.getData();

        //동그라미 클릭하면 해당 화면으로 전환 기능 - 아직 미구현 , 버튼으로만 가능하게끔 함
        // const circleArr = Array.from(document.querySelectorAll(".carousel-circle"));
        // circleArr.forEach(function (e) {
        //     const that=this;
        //     e.addEventListener("click",function(){
        //         this.index = parseInt(e.getAttribute("name"));
        //         this.changeCircle();
        //     }.bind(that));
        // }.bind(this));

    }

    changeIndex(value) {
        this.index += value;
        console.log(this.index);
    }

    setDurationZero(){
        this.reviewNavi.style.transition="none";
    }

    setDurationfull(){
        this.reviewNavi.style.transition="";
        this.reviewNavi.style.transitionDuration="1s";
    }

    nextPage(){
        this.setDurationfull();
        this.changeIndex(1);
        const left = (this.index+1) * 100;
        this.reviewNavi.style.left = "-" + left + "%";

        if(this.index === this.count){
            console.log("sisi");

            this.index = 0;
            setTimeout(function () {
                this.setDurationZero();
                this.reviewNavi.style.left="-100%";
            }.bind(this), 1000);

        }

        this.changeCircle();
    }

    beforePage(){
        this.setDurationfull();
        this.changeIndex(-1);
        const left = (this.index+1) * 100;
        this.reviewNavi.style.left = "-" + left + "%";


        if(this.index === -1){
            this.index = 9;
            setTimeout(function () {
                this.setDurationZero();
                this.reviewNavi.style.left="-1000%";
            }.bind(this), 1000);
        }

        this.changeCircle();
    }

    changeCircle(){
        const beforeCircle = document.querySelector(".carousel-circle-selected");
        beforeCircle.setAttribute("class","carousel-circle");


        const arr = Array.from(document.querySelectorAll(".carousel-circle"));
        arr[this.index].setAttribute("class","carousel-circle carousel-circle-selected");
    }

    getData() {
        firebase.database().ref('/review').once('value').then(function(snapshot) {
            this.setData(snapshot.val());
        }.bind(this));
    }

    setData(data){
        this.data = data;


        const arr = []
        arr.push(this.data["R0010"]);

        for(let i = 1 ;i<=10;i++){
            if(i>=10&&i<100){
                arr.push(this.data["R00"+i]);
            }else{
            arr.push(this.data["R000"+i]);
            }
        }
        arr.push(this.data["R0001"]);


        const util = new Util();
        console.log(arr);

        util.template(arr,this.template,this.sec);
        this.reviewNavi = document.getElementById(this.reviewNavi);
    }
}

class Counter{
    constructor(max){
        this.max = max;
    }

    setCounter(){
        var max = this.max;
        $(window).scroll(function () {
            var val = $(this).scrollTop();
            var cover = $('.cover');
            if (max < val) {
                $('#counter1').animateNumber({ number: 4200 },2000);
                $('#counter2').animateNumber({ number: 3203 },2000);
                $('#counter3').animateNumber({ number: 23 },2000);
                max = 99999;
            }
        });

    }


}
