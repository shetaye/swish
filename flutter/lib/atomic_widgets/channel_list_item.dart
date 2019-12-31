import 'package:flutter/material.dart';
import 'package:meteor/models/channel.dart';
import 'package:meteor/routes.dart';
import 'package:meteor/atomic_widgets/custom_card.dart';

class MeteorChannelListItem extends StatelessWidget {
  final Channel channel;

  MeteorChannelListItem(this.channel);

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      child: ListTile(
        leading: FlutterLogo(),
        title: Text(channel.name),
        subtitle: Text('Lorem Ipsum'),
        onTap: () {
          Navigator.pushNamed(context, channelRoute, arguments: channel);
        }
      ),
    );
  }
  /*@override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(
        vertical: 10.0
      ),
      height: 100,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20.0),
        color: Colors.white,
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10.0,
            offset: Offset(0.0, 10.0),
          )
        ]
      ),
      child: Padding(
        padding: EdgeInsets.all(20.0),
        child: Align(
          alignment: Alignment.topLeft,
          child: Text(
            channel.name,
            style: TextStyle(
              fontSize: 24.0,
            ),
          ),
        ),
      ),
    );
  }
  */
}