document.addEventListener('DOMContentLoaded', function () {
    const reviewParams = {
        sort_tab: '.review-query-type-wrapper',
        selected_sort: 'selected-review-query-tab',
        sort_check_key: 'review-query-tab selected-review-query-tab',
        template: '#card-review-page-template',
        content: '.review-item-list-wrapper',
        readmore: 'review-card-readmore'
    };

    /* @TODO 처리 순서 정하기
      클릭시 상품 팝업
      추가적인 디버깅
    */
    new ReviewPage(reviewParams);
});

class ReviewPage {
    constructor(reviewParams, reviewObj) {
        this.template = document.querySelector(reviewParams.template).innerHTML;
        this.review_content = document.querySelector(reviewParams.content);
        this.readmore = document.getElementsByClassName(reviewParams.readmore);

        this.sort_review_tab = document.querySelector(reviewParams.sort_tab);
        this.selected_sort_review_tab = reviewParams.selected_sort;
        this.sort_key = reviewParams.sort_check_key;

        this.domControlKey = 'date';

        this.maxiumWord = 240;
        this.arrayObj = this.getArrayObject();

        this.init();
    }

    init() {
        // this.setDefaultReviewData();
        this.setSorting(this.domControlKey);
        this.sortEvent(this.selected_sort_review_tab, this.sort_key);
        this.reloadEvent();
    }

    sortEvent(selectedClassName, key) {
        this.sort_review_tab.addEventListener('click', function (e) {
            const selectedTab = document.getElementsByClassName(selectedClassName)[0];

            selectedTab.classList.remove(selectedClassName);
            e.target.classList.add(selectedClassName);

            const changeSelectedTab = document.getElementsByClassName(selectedClassName)[0];

            if (changeSelectedTab.getAttribute('class') == key) {
                const requestParam = changeSelectedTab.getAttribute('name');
                this.domControlKey = requestParam;
                this.setSorting(requestParam);
            } else {
                e.target.classList.remove(selectedClassName);
                selectedTab.classList.add(selectedClassName);
            }
        }.bind(this));
    }

    setSorting(params) {
        const queryObj = [];
        let sortObj = [];

        for (const key in this.arrayObj) {
            queryObj.push(this.arrayObj[key]);
        }

        switch (params) {
            case 'date':
                sortObj = this.setDateSorting(queryObj);
                break;
            case 'useful':
                sortObj = this.setUsefulSorting(queryObj);
                break;
            default:
                break;
        }

        this.arrayObj = sortObj;

        this.setDefaultReviewData();
    }

    setUsefulSorting(array) {
        array.sort(function (a, b) {
            const beforeUseful = parseInt(a.useful);
            const afterUseful = parseInt(b.useful);

            if (beforeUseful < afterUseful) {
                return 1;
            } else if (beforeUseful > afterUseful) {
                return -1;
            } else {
                return 0;
            }
        });

        return array;
    }

    setDateSorting(array) {
        array.sort(function (a, b) {
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

        return array;
    }

    setDefaultReviewData() {
        this.start = 0;
        this.end = 6;
        this.height = 400;

        const data = this.arrayObj;

        const resultValue = [];
        for (let i = this.start; i < this.end; i++) {
            const key = Object.keys(data)[i];
            const value = data[key];

            if (!!value) {
                if (value.comment.length > this.maxiumWord) {
                    value["comment"] = this.getCommentOptions(value.comment);
                }
                value["brand_image"] = this.getBrandImage(value.brand);
                value["rating"] = "card-rank-rating" + i;
                resultValue.push(value);
            }
        }

        const template = Handlebars.compile(this.template);
        this.review_content.innerHTML = template(resultValue);
        this.setRatingHandler(resultValue);
    }

    getArrayObject() {
        const review = localStorage['review'];
        const obj = JSON.parse(review);

        const queryObj = [];

        for (const key in obj) {
            const value = obj[key];

            const time = value.timestamp;

            const splitTimestamp = time.split(' ');

            value['date'] = splitTimestamp[0];
            value['time_score'] = this.getDate(splitTimestamp[0]) + this.getTime(splitTimestamp[1]);
            value['key'] = key;

            queryObj.push(value);
        }

        return queryObj;
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

    getCommentOptions(value) {
        let result = '';

        const str = value.split('');

        for (let i = 0; i < this.maxiumWord; i++) {
            result += str[i];
        }

        result += '...';

        return result;
    }

    getBrandImage(value) {
        switch (value) {
            case 'gs25':
            case 'GS25':
                return '../image/gs25.jpg';
            case 'cu':
            case 'CU':
                return '../image/cu.jpg';
            case 'seven':
            case '7ELEVEN':
            case '7-eleven':
                return '../image/seven.png';
            default:
                return '전체 카테고리';
        }
    }

    setReviewData() {
        const resultValue = [];
        const element = document.createElement('div');

        for (let i = this.start; i < this.end; i++) {
            const key = Object.keys(this.arrayObj)[i];
            const value = this.arrayObj[key];

            if (!!value) {
                if (value.comment.length > this.maxiumWord) {
                    value["comment"] = this.getCommentOptions(value.comment);
                }

                value["brand_image"] = this.getBrandImage(value.brand);
                value["rank"] = (i + 1).toString();
                value["rating"] = "card-rank-rating" + i;
                resultValue.push(value);
            }
        }
        const template = Handlebars.compile(this.template);
        element.innerHTML = template(resultValue);

        this.review_content.appendChild(element);

        this.setRatingHandler(resultValue);
    }

    reloadEvent() {
        const that = this;
        $(window).scroll(function () {
            const val = $(this).scrollTop();

            if (that.height < val) {
                that.start += 6;
                that.end += 6;
                that.height += 1000;
                that.setReviewData();
            }
        });
    }

    setRatingHandler(value) {
        let i = this.start;
        for (const x of value) {
            $("#card-rank-rating" + i).rateYo({
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