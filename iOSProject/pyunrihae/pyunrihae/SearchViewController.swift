//
//  SearchViewController.swift
//  pyunrihae
//
//  Created by woowabrothers on 2017. 8. 14..
//  Copyright © 2017년 busride. All rights reserved.
//

import UIKit


class SearchViewController: YNSearchViewController,YNSearchDelegate {
    var db : [YNSearchModel] = []
    let appdelegate = UIApplication.shared.delegate as! AppDelegate
    let demoCategories = ["도시락","김밥","베이커리","라면","식품","스낵","아이스크림","음료"]
    override func viewDidLoad() {
        super.viewDidLoad()
        let ynSearch = YNSearch()
        let historyList = ynSearch.getSearchHistories()
        ynSearch.setCategories(value: demoCategories)
        if historyList != nil {
            ynSearch.setSearchHistories(value: historyList!)
        }
        self.ynSearchinit()
        self.delegate = self
        self.ynSearchView.ynSearchMainView.redrawSearchHistoryButtons()
        for product in appdelegate.productList {
            let searchModel  = YNSearchModel.init(key: product.name,id : product.id)
            db.append(searchModel)
        }
        DispatchQueue.main.async {
            self.initData(database: self.db)
            self.setYNCategoryButtonType(type: YNCategoryButtonType.border)
        }
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    @IBAction func onBackBtnPressed(_ sender: Any) {
        self.dismiss(animated: true, completion: nil)
    }
    func ynSearchListViewDidScroll() {
        self.ynSearchTextfieldView.ynSearchTextField.endEditing(true)
    }
    func ynSearchHistoryButtonClicked(text: String) {
        // 검색 history가 카테고리와 같으면 카테고리로 보냄
        for category in demoCategories {
            if text == category {
                pushRankingController(text: text)
            }
        }
        var key = ""
        for i in 0..<db.count{
            if db[i].key == text {
                key = db[i].id!
            }
        }
        self.pushViewController(text : key)
    }
    func ynCategoryButtonClicked(text: String) {
       pushRankingController(text: text)
    }
    func ynSearchListViewClicked(key: String) {
        self.pushViewController(text: key)
    }
    func ynSearchListViewClicked(object: Any) {
    }
    func ynSearchListView(_ ynSearchListView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = self.ynSearchView.ynSearchListView.dequeueReusableCell(withIdentifier: YNSearchListViewCell.ID) as! YNSearchListViewCell
        if let ynmodel = self.ynSearchView.ynSearchListView.searchResultDatabase[indexPath.row] as? YNSearchModel {
            cell.searchLabel.text = ynmodel.key
        }
        
        return cell
    }
    func ynSearchListView(_ ynSearchListView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if let ynmodel = self.ynSearchView.ynSearchListView.searchResultDatabase[indexPath.row] as? YNSearchModel, let key = ynmodel.key {
            let id = ynmodel.id!
            self.ynSearchView.ynSearchListView.ynSearchListViewDelegate?.ynSearchListViewClicked(key: id)
            self.ynSearchView.ynSearchListView.ynSearchListViewDelegate?.ynSearchListViewClicked(object: self.ynSearchView.ynSearchListView.database[indexPath.row])
            self.ynSearchView.ynSearchListView.ynSearch.appendSearchHistories(value: key)
        }
    }
    func pushViewController(text:String) {
        SelectedProduct.foodId = text
        SelectedProduct.reviewCount = 0
        DataManager.getReviewListBy(id: text) { (reviewList) in
            SelectedProduct.reviewCount = reviewList.count
            NotificationCenter.default.post(name: NSNotification.Name("complete"), object: self)
        }
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "mainNavigationController") as! UINavigationController
        self.present(vc, animated: true, completion: nil)
    }
    func pushRankingController(text : String) {
        NotificationCenter.default.post(name: NSNotification.Name("showRanking"), object: self)
        
        var categoryIndex = 0
        switch (text){
        case "도시락" : categoryIndex = 1
        case "김밥" : categoryIndex = 2
        case "베이커리" : categoryIndex = 3
        case "라면": categoryIndex = 4
        case "식품" : categoryIndex = 5
        case "스낵" : categoryIndex = 6
        case "아이스크림" : categoryIndex = 7
        case "음료" : categoryIndex = 8
        default : categoryIndex = 0
        }
        NotificationCenter.default.post(name: NSNotification.Name("selectCategory"), object: self, userInfo: ["category" : categoryIndex])
        self.dismiss(animated: true, completion: nil)
    }
}
