import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:meteor/models/channel.dart';
import 'package:meteor/routes.dart';
import 'package:meteor/screens/channel.dart';
import 'package:meteor/services/user.dart';
import 'package:meteor/stateless_widgets/channel_list_item.dart';

class MeteorProfileScreen extends StatefulWidget {
  MeteorProfileScreen({Key key}) : super(key: key);

  @override
  _MeteorProfileScreenState createState() => _MeteorProfileScreenState();
}

class _MeteorProfileScreenState extends State<MeteorProfileScreen> {

  Future< FirebaseUser > _currentUser;
  Future< List< Channel > > _channels;

  @override void initState() {
    _currentUser = FirebaseAuth.instance.currentUser();
    _channels = _currentUser.then(getChannels);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(20.0),
          child: Column(
            children: <Widget>[
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Me',
                  style: TextStyle(
                    fontSize: 32.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Channels',
                  style: TextStyle(
                    fontSize: 24.0,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              FutureBuilder(
                future: _channels,
                builder: (context, snapshot) {
                  if(snapshot.hasError) {
                    return Text(snapshot.error.toString());
                  }
                  if(snapshot.hasData) {
                    // Weird but sound way to go from List< Channel > to List< Widget >
                    List< Widget > mappedChannels = <Widget>[...snapshot.data.map((Channel channel) {
                      return InkWell(
                        child: MeteorChannelListItem(channel),
                        onTap: () {
                          Navigator.pushNamed(context, channelRoute, arguments: MeteorChannelScreenArguments(channel));
                        }
                      );
                    }).toList()];
                    return Column(
                      children: [...mappedChannels,
                        RaisedButton(
                          onPressed: () {
                            Navigator.pushNamed(context, createChannelRoute);
                          },
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20.0),
                          ),
                          color: Theme.of(context).primaryColor,
                          child: Text('New Channel'),
                        )
                      ]
                    );
                  }
                  return Text('Loading...');
                },
              ),
            ],
          )
        )
      ),
    );
  }
}