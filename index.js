var util = require("util");
var url = require("url");

module.exports = function (everyauth) {
  if (! everyauth.oauth) {
    everyauth.oauth = require("everyauth-oauth")(everyauth);
  }
  everyauth.twitter =
  everyauth.oauth.submodule("twitter")
  .apiHost('https://api.twitter.com')
  .oauthHost('https://api.twitter.com')
  .entryPath('/auth/twitter')
  .callbackPath('/auth/twitter/callback')
  .authorizePath('/oauth/authenticate')
  .fetchOAuthUser( function (accessToken, accessTokenSecret, params) {
    var promise = this.Promise();
    this.oauth.get(this.apiHost() + '/1.1/users/show.json?user_id=' + params.user_id, accessToken, accessTokenSecret, function (err, data, res) {
      if (err) {
        err.extra = {data: data, res: res};
        return promise.fail(err);
      }
      var oauthUser = JSON.parse(data);
      promise.fulfill(oauthUser);
    });
    return promise;
  })
  .authCallbackDidErr( function (req) {
    var parsedUrl = url.parse(req.url, true);
    return parsedUrl.query && !!parsedUrl.query.denied;
  });

  return everyauth.twitter;
};
