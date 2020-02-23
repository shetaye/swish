import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:meteor/routes.dart';

class MeteorRegisterScreen extends StatefulWidget {
  MeteorRegisterScreen({Key key}) : super(key: key);

  @override
  _MeteorRegisterScreenState createState() => _MeteorRegisterScreenState();
}

class _MeteorRegisterScreenState extends State<MeteorRegisterScreen> {

  final emailInputController = TextEditingController();
  final pwdInputController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _error;

  // Thanks to https://heartbeat.fritz.ai/firebase-user-authentication-in-flutter-1635fb175675
  String emailValidator(String value) {
    Pattern pattern =
        r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
    RegExp regex = new RegExp(pattern);
    if (!regex.hasMatch(value)) {
      return 'Invalid email';
    } else {
      return null;
    }
  }

  String pwdValidator(String value) {
    if(value.length < 1) {
      return 'Invalid password';
    } else {
      return null;
    }
  }

  Future< void > register() async {
    if(!_formKey.currentState.validate()) {
      return null;
    }
    try {
      await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: emailInputController.text,
        password: pwdInputController.text,
      );
      Navigator.pushNamedAndRemoveUntil(context, tabHostRoute, (Route<dynamic> route) => false);
    } on PlatformException catch(e) {
      setState(() {
        _error = e.message;
      });
      print(e.code);
      print(e.message);
    }
    
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      /*appBar: AppBar(
        title: Text('Login'),
        leading: Container(),
      ),*/
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(60.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Email', hintText: 'jonnyAseed@apple.com'
                  ),
                  controller: emailInputController,
                  keyboardType: TextInputType.emailAddress,
                  validator: emailValidator,
                ),
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Password', hintText: '********'
                  ),
                  controller: pwdInputController,
                  keyboardType: TextInputType.text,
                  validator: pwdValidator,
                ),
                SizedBox(
                  height: 30.0,
                ),
                RaisedButton(
                  child: Text('Register'),
                  color: Theme.of(context).primaryColor,
                  onPressed: register,
                ),
              ],
            ),
          )
        ),
      ),
    );
  }
}