//
//  SignupViewController.swift
//  pyunrihae
//
//  Created by woowabrothers on 2017. 8. 16..
//  Copyright © 2017년 busride. All rights reserved.
//

import UIKit
import FirebaseAuth

class SignupViewController: UIViewController {

    @IBOutlet weak var passWordConfirmTextField: UITextField!
    @IBOutlet weak var passWordTextField: UITextField!
    @IBOutlet weak var emailTextField: UITextField!
    @IBOutlet weak var completeBtn: UIButton!
    @IBOutlet weak var nicknameTextField: UITextField!
    @IBOutlet weak var emailAlertLabel: UILabel!
    @IBOutlet weak var passwordAlertLabel: UILabel!
    @IBOutlet weak var passwordConfirmAlertLabel: UILabel!
    @IBOutlet weak var alertView: UILabel!
    override func viewDidLoad() {
        super.viewDidLoad()
        let tap: UITapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        view.addGestureRecognizer(tap)
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    @IBAction func onCancelBtnPressed(_ sender: Any) {
        navigationController?.popViewController(animated: true)
        dismissKeyboard()
        dismiss(animated: true, completion: nil)
    }
    func dismissKeyboard() {
        //Causes the view (or one of its embedded text fields) to resign the first responder status.
        view.endEditing(true)
    }
    @IBAction func onEmailTextChanged(_ sender: Any) {
        if Validator.isValidEmail(email: emailTextField.text!) {
            emailAlertLabel.isHidden = true
        }else{
            emailAlertLabel.isHidden = false
        }
        isValidSignup()
    }
    
    @IBAction func onPasswordTextChanged(_ sender: Any) {
        if Validator.isValidPassWord(password: passWordTextField.text!) {
            passwordAlertLabel.isHidden = true
        }else{
            passwordAlertLabel.isHidden = false
        }
        isValidSignup()
    }
    
    @IBAction func onPasswordConfirmTextChanged(_ sender: Any) {
        if Validator.isSamePassWord(password: passWordTextField.text!, confirmPassword: passWordConfirmTextField.text!){
            passwordConfirmAlertLabel.isHidden = true
        }else{
            passwordConfirmAlertLabel.isHidden = false
        }
        isValidSignup()
    }
    
    func isValidSignup(){
        if Validator.isValidSign(email: emailTextField.text!,password: passWordTextField.text!, confirmPassword: passWordConfirmTextField.text!) && (nicknameTextField.text?.characters.count)! > 0 {
           completeBtn.isEnabled = true
        }else{
            completeBtn.isEnabled = false
        }
    }
   
    @IBAction func signUp(_ sender: Any) {
        if completeBtn.isEnabled {
            // 회원가입 과정을 다 통과하면 user 만듦
            if (nicknameTextField.text?.characters.count)! > 10 {
                let alert = UIAlertController(title: "알림", message: "10자 이내로 닉네임을 설정해주세요!", preferredStyle: UIAlertControllerStyle.alert)
                alert.addAction(UIAlertAction(title: "Ok", style: UIAlertActionStyle.cancel, handler: nil))
                self.present(alert, animated: true, completion: nil)
            } else {
                dismissKeyboard()
                Auth.auth().createUser(withEmail: emailTextField.text!, password: passWordTextField.text!) { (user, error) in
                    
                    if error == nil {
                        let user_instance = User.init(id: (user?.uid)!, email: (user?.email)!, nickname: self.nicknameTextField.text!)
                        DataManager.saveUser(user: user_instance)
                        
                        Auth.auth().signIn(withEmail: self.emailTextField.text!, password: self.passWordTextField.text!) { (user, error) in
                            if error != nil {
                                self.alertView.text = "로그인에 실패했습니다."
                                self.alertView.alpha = 1
                                UIView.animate(withDuration: 2.0, animations: {
                                    self.alertView.alpha = 0
                                })
                            }else{
                                self.dismiss(animated: true, completion: {
                                    let appDelegate = UIApplication.shared.delegate as! AppDelegate
                                    appDelegate.user? = user_instance
                                    NotificationCenter.default.post(name: NSNotification.Name("userLogined"), object: nil)
                                })
                            }
                        }
                    }else{
                        self.alertView.text = "회원가입에 실패했습니다."
                        self.alertView.alpha = 1
                        UIView.animate(withDuration: 2.0, animations: {
                            self.alertView.alpha = 0
                        })
                    }
                }
            }
        }
    }
}
