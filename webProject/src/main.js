import timestamp from './productDetail.js'

export class Dropdown {

    constructor(event, button, drop) {
        this.event = event;
        this.button = button;
        this.drop = drop;
        this.init();
    }

    init() {
        this.button = document.querySelector(this.button);
        this.drop = document.querySelector(this.drop);
        this.setEvent();
    }

    setEvent() {
        this.button.addEventListener(this.event, function () {

            if (this.drop.style.display === "block") {
                this.drop.style.display = "none";
            } else {
                this.drop.style.display = "block";
            }
        }.bind(this), true);
    }
}

export class Util {

    ajax(func) {
        const oReq = new XMLHttpRequest();
        oReq.addEventListener('load', function (e) {
            const data = JSON.parse(oReq.responseText);
            func.setData(data);
        });

        oReq.open('GET', func.url);
        oReq.send();
    }

    template(data, template, section) {
        const context = data;
        const tmpl = Handlebars.compile(template);
        section.innerHTML = tmpl(context);
    }

    setHandlebars(value) {
        let i = 0;
        for (const x of value) {
            $("#carousel-review-star" + i).rateYo({
                rating: x.grade,
                readOnly: true,
                spacing: "10px",
                starWidth: "20px",
                normalFill: "#e2dbd6",
                ratedFill: "#ffcf4d"
            });
            i++;
        }
    }
}

//main 상단 리뷰 캐러셀
export class Carousel {

    constructor(reviewNavi, leftButton, rightButton, count, template, sec) {
        this.reviewNavi = reviewNavi;
        this.leftButton = leftButton;
        this.rightButton = rightButton;
        this.count = count;
        this.template = template;
        this.sec = sec;
        this.data = [];
        this.index = 0;

        this.now = getNowTimeScore();
        this.init();
    }

    init() {
        this.leftButton = document.getElementById(this.leftButton);
        this.rightButton = document.getElementById(this.rightButton);
        this.template = document.getElementById(this.template).innerHTML;
        this.sec = document.getElementById(this.sec);
        this.leftButton.addEventListener("click", function () {
            this.beforePage();
        }.bind(this));
        this.rightButton.addEventListener("click", function () {
            this.nextPage();
        }.bind(this));
        this.setData();
    }

    changeIndex(value) {
        this.index += value;
    }

    setDurationZero() {
        this.reviewNavi.style.transition = "none";
    }

    setDurationfull() {
        this.reviewNavi.style.transition = "";
        this.reviewNavi.style.transitionDuration = "1s";
    }

    nextPage() {
        this.setDurationfull();
        this.changeIndex(1);
        const left = (this.index + 1) * 100;
        this.reviewNavi.style.left = "-" + left + "%";
        if (this.index === this.count) {

            this.index = 0;
            this.rightButton.disabled = true;

            setTimeout(function () {
                this.setDurationZero();
                this.reviewNavi.style.left = "-100%";
                console.log("sss")
                this.rightButton.disabled = false;
            }.bind(this), 1000);

        }

        this.changeCircle();
    }

    beforePage() {
        this.setDurationfull();
        this.changeIndex(-1);
        const left = (this.index + 1) * 100;
        this.reviewNavi.style.left = "-" + left + "%";


        if (this.index === -1) {
            this.index = 9;
            this.leftButton.disabled = true;

            setTimeout(function () {
                this.setDurationZero();
                this.reviewNavi.style.left = "-1000%";
                this.leftButton.disabled = false;
            }.bind(this), 1000);
        }

        this.changeCircle();

    }

    changeCircle() {
        const beforeCircle = document.querySelector(".carousel-circle-selected");
        beforeCircle.setAttribute("class", "carousel-circle");

        const arr = Array.from(document.querySelectorAll(".carousel-circle"));
        arr[this.index].setAttribute("class", "carousel-circle carousel-circle-selected");
    }


    setData() {
        const review = localStorage['review'];
        this.data = JSON.parse(review);

        const fakeArr = [];
        const queryObj = [];

        for (const key in this.data) {
            const value = this.data[key];

            const time = value.timestamp;

            const splitTimeStamp = time.split(' ');

            value['time_score'] = this.getDate(splitTimeStamp[0]) + this.getTime(splitTimeStamp[1]);

            const dateValue = this.getDateWord(value.time_score);

            value['date'] = (!!dateValue) ? dateValue : splitTimeStamp[0];

            queryObj.push(value);
        }

        queryObj.sort(function (a, b) {
            const beforeTimeScore = parseFloat(a.time_score);
            const afterTimeScore = parseFloat(b.time_score);

            if (beforeTimeScore < afterTimeScore) {
                return 1;
            } else if (beforeTimeScore > afterTimeScore) {
                return -1;
            } else {
                return 0;
            }
        });

        const fakeBeforeValue = this.clone(queryObj[9]);
        fakeBeforeValue["rating"] = "carousel-rank-rating" + '0';

        const fakeAfterValue = this.clone(queryObj[0]);
        fakeAfterValue["rating"] = "carousel-rank-rating" + '11';

        const arr = [];

        arr.push(fakeBeforeValue);
        for (let i = 0; i <= 9; i++) {
            const value = queryObj[i];

            value["rating"] = "carousel-rank-rating" + (i + 1);

            arr.push(value);
        }
        arr.push(fakeAfterValue);

        const util = new Util();

        util.template(arr, this.template, this.sec);
        this.reviewNavi = document.getElementById(this.reviewNavi);

        this.setRatingHandler(arr);
    }

    getDateWord(value) {
        const date = (this.now * 1e6) - (value * 1e6);

        if (date < 6000) {
            if (date / 100 === 0) {
                return '방금 전';
            } else {
                return parseInt(date / 100) + '분 전';
            }
        } else if (date >= 1e6 && date <= 3e6) {
            return parseInt(date / 1e6) + '일 전';
        } else if (date <= 1e6) {
            const day = parseInt(this.now);
            const nowHour = parseInt((this.now - day) * 10000) + 2400;
            const hour = parseInt((value - 634) * 10000);
            if (hour > 1e4) {
                return parseInt(hour / 1e4) + '시간 전';
            } else {
                return parseInt((nowHour - hour) / 100) + '시간 전';
            }
        }
    }

    clone(obj) {
        if (obj === null || typeof(obj) !== 'object')
            return obj;
        const copy = obj.constructor();
        for (const attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr];
            }
        }
        return copy;
    }

    setRatingHandler(value) {
        let i = 0;
        for (const x of value) {
            $('#carousel-rank-rating' + i).rateYo({
                rating: x.grade,
                spacing: "10px",
                starWidth: "20px",
                normalFill: "#e2dbd6",
                ratedFill: "#ffcf4d"
            });
            i++;
        }
    }

    getDate(value) {
        const splitDate = value.split('-');

        const yy = parseInt(splitDate[0]);
        const mm = parseInt(splitDate[1]);
        const dd = parseInt(splitDate[2]);

        let dateValue = 0;

        for (let x = 2016; x < yy; x++) {
            if (x % 4 == 0) {
                if (x % 100 != 0 || x % 400 == 0) {
                    dateValue += 366;
                }
            } else {
                dateValue += 365;
            }
        }

        for (let x = 1; x < mm; x++) {
            switch (x) {
                case 4:
                case 6:
                case 9:
                case 11:
                    dateValue += 31;
                    break;
                case 2:
                    dateValue += 28;
                default:
                    dateValue += 31;
                    break;
            }
        }

        dateValue += dd;

        return (dateValue);
    }

    getTime(value) {
        const splitTime = value.split(':');

        const hh = parseInt(splitTime[0]);
        const mm = parseInt(splitTime[1]);
        const ss = parseInt(splitTime[2]);

        let timeValue = 0;

        timeValue = (mm + (hh * 60)) * 100;
        timeValue += ss;

        return timeValue / 1e6;
    }
}

// 메시지 토스트 기능
export class Toast {
    constructor(message) {
        this.message = message;
        this.setEvent();
    }

    setEvent() {

        const element = document.querySelector('#toast-msg')
        element.innerHTML = this.message;
        // element.style.display = 'block'
        element.style.display = "block";
        setTimeout(function () {
            // element.style.display = 'none'
            element.style.display = "none";

        }, 1000)
    }
}

//메인 상단 고정 탭
export class SearchTab {
    constructor(searchParams) {
        this.searchParams = {
            brand: '.fixTab-search-brand',
            brand_dropdown: '.fixTab-search-brand-dropdown',
            category: '.fixTab-search-category',
            category_drowndown: '.fixTab-search-category-dropdown',
            text: '.fixTab-search-word',
            button: '.fixTab-search-button'
        };

        this.brandDrop = document.querySelector(this.searchParams.brand);
        this.brandNavi = document.querySelector(this.searchParams.brand_dropdown);
        this.categoryDrop = document.querySelector(this.searchParams.category);
        this.categoryNavi = document.querySelector(this.searchParams.category_drowndown);
        this.inputText = document.querySelector(this.searchParams.text);
        this.searchButton = document.querySelector(this.searchParams.button);
        this.fixTabNavi = document.querySelector("#fixTabNavi");

        this.init();
    }

    init() {
        this.dropdownEvent();
        this.setTabClickEvent();
    }

    dropdownEvent() {
        const brandDrop = new Dropdown("click", this.searchParams.brand, this.searchParams.brand_dropdown);
        const categoryDrop = new Dropdown("click", this.searchParams.category, this.searchParams.category_drowndown);


        this.brandNavi.addEventListener("click", function (event) {
            this.brandDrop.firstChild.innerText = event.toElement.innerText;
        }.bind(this));

        this.categoryNavi.addEventListener("click", function (event) {
            this.categoryDrop.firstChild.innerText = event.toElement.innerText;
        }.bind(this));

        this.searchButton.addEventListener("click", function () {
            this.setQuery();

            document.querySelector(".main-wrapper").style.display = "none";
            document.querySelector(".rank-container").style.display = "";
        }.bind(this));
    }


    setQuery() {
        const queryBrand = this.brandDrop.firstChild.innerText;
        const queryCategory = this.categoryDrop.firstChild.innerText;

        const brand = (queryBrand === '브랜드') ? 'all' : queryBrand;
        const category = (queryCategory === '카테고리') ? '전체' : queryCategory;
        const text = this.inputText.value;

        const value = {
            brand: brand,
            category: category,
            keyword: text
        };

        localStorage['search_keyword'] = JSON.stringify(value);
    }

    setTabClickEvent() {
        this.fixTabNavi.addEventListener('click', function (e) {
            const selectedTab = document.getElementsByClassName("fixTab-select")[0];

            selectedTab.classList.remove("fixTab-select");
            e.target.classList.add("fixTab-select");

            const text = document.getElementsByClassName("fixTab-select")[0].innerHTML;

            const value = {
                brand: 'all',
                category: '전체',
                keyword: ''
            };

            localStorage['search_keyword'] = JSON.stringify(value);

            if (text === "편리해") {
                document.querySelector(".main-wrapper").style.display = "";
                document.querySelector(".rank-container").style.display = "none";
                document.querySelector(".review-container").style.display = "none";
            } else if (text === "랭킹") {
                document.querySelector(".main-wrapper").style.display = "none";
                document.querySelector(".rank-container").style.display = "";
                document.querySelector(".review-container").style.display = "none";
            } else if (text === "리뷰") {
                document.querySelector(".main-wrapper").style.display = "none";
                document.querySelector(".rank-container").style.display = "none";
                document.querySelector(".review-container").style.display = "";
            }

        }.bind(this));
    }

}

//메인 하단 jquery plugin 을 이용한 counter, 매개변수는 스크롤 위치를 의미
export class Counter {
    constructor(max) {
        this.max = max;
        this.c1 = 0;
        this.c2 = 0;
        this.c3 = 0;
        this.setData();
        this.setAnimation()

    }

    setAnimation() {
        window.addEventListener('scroll', function (e) {
            let val = $(window).scrollTop();
            let max = this.max;
            const cover = $('.cover');

            if (max < val) {
                $('#counter1').animateNumber({number: this.c1}, 2000);
                $('#counter2').animateNumber({number: this.c2}, 2000);
                $('#counter3').animateNumber({number: this.c3}, 2000);
                this.max = 99999;
            }
        }.bind(this));
    }

    setData() {
        const productStorage = localStorage['product'];
        const productData = JSON.parse(productStorage);

        const reviewStorage = localStorage['review'];
        const reviewData = JSON.parse(reviewStorage);

        const productCount = Object.keys(productData).length;
        const reviewCount = Object.keys(reviewData).length;
        let todayReviewCount = 0;

        Object.keys(reviewData).forEach(function (e) {
            if (timestamp().split(" ")[0] === reviewData[e].timestamp.split(" ")[0]) {
                todayReviewCount += 1;
            }
        })


        this.c1 = parseInt(productCount);
        this.c2 = parseInt(reviewCount);
        this.c3 = parseInt(todayReviewCount);


    }
}

function getNowTimeScore() {
    const d = new Date();
    const curr_date = d.getDate();
    const curr_month = d.getMonth() + 1; //Months are zero based
    const curr_year = d.getFullYear();
    const curr_hour = d.getHours();
    const curr_minute = d.getMinutes();
    const curr_second = d.getSeconds();

    let dateValue = 0;

    for (let x = 2016; x < curr_year; x++) {
        if (x % 4 == 0) {
            if (x % 100 != 0 || x % 400 == 0) {
                dateValue += 366;
            }
        } else {
            dateValue += 365;
        }
    }

    for (let x = 1; x < curr_month; x++) {
        switch (x) {
            case 4:
            case 6:
            case 9:
            case 11:
                dateValue += 31;
                break;
            case 2:
                dateValue += 28;
            default:
                dateValue += 31;
                break;
        }
    }

    dateValue += curr_date;


    let timeValue = 0;

    timeValue = (curr_minute + (curr_hour * 60)) * 100;
    timeValue += curr_second;

    return parseFloat(dateValue + (timeValue / 1e6));
}
