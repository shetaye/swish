import 'package:flutter/material.dart';
import 'package:swish/atomic_widgets/custom_card.dart';
import 'package:swish/models/video.dart';
import 'package:swish/utils.dart';

class SwishSmallVideoTile extends StatelessWidget {
  final Video video;
  final Widget trailingAction;

  SwishSmallVideoTile({this.video, this.trailingAction});

  @override
  Widget build(BuildContext context) {
    return SwishCustomCard(
      child: Padding(
        padding: const EdgeInsets.only(right: 16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20.0),
                    color: Colors.black,
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10.0,
                        offset: Offset(10.0, 0.0),
                      )
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20.0),
                    child: Image.network(
                      'https://image.mux.com/${video.content.playbackID}/thumbnail.png',
                      width: 128,
                      height: 72,
                    ),
                  ),
                ),
                SizedBox(
                  width: 10,
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(video.title),
                    Text(formatAge(video.uploadDate),
                        style: TextStyle(
                          color: Colors.black38,
                        )),
                  ],
                )
              ],
            ),
            trailingAction,
          ],
        ),
      ),
    );
  }
}
