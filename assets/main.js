/**
 * @此专题出自澎湃新闻网，http://thepaper.cn, 
 * @date    2014-12-29 14:05:23
 *By jigl@thepaper.cn, 43754530@qq.com
 *制作团队：龙毅，张巍，张金伟，赵冠群，季国亮
 */

$(function(){
var bigImg = $('.outter-circle img')[0].src;
var weixin_share = $('#paper-share a').eq(0);
window.weiXinConfig= {
	debug:false,
	appId: '',
	timestamp:'',
	nonceStr:'',
	signature:''
};
if(!bigImg.complete){
	$('.title-box').addClass('show');
}

function wxshare(){
	wx.ready(function(){
		wx.onMenuShareTimeline({
			title:shareData.title,
			imgUrl:shareData.imgUrl,
			link:shareData.link,
			desc:shareData.desc

		});
		wx.onMenuShareAppMessage({
			title:shareData.title,
			imgUrl:shareData.imgUrl,
			link:shareData.link,
			desc:shareData.desc
		});
	})
}

/*add wei xin share tip*/
function addWeixinTip(){
    $('.container').append("<div class='weixin-tip'></div>");
    var $weixin_tip = $('.weixin-tip')
                            .append('<div class="absolute tip-arrow"></div>')
                            .append('<div class="mt100"><p>请点击右上角</p><p>【分享到朋友圈】</p><p>或</p><p>【发送给朋友】</p></div>')
                            .append('<div class="logo"><a href="http://thepaper.cn"><img src="assets/paper-logo.svg"/></a></div>')
                            .click(function(){
                                $(this).fadeOut('fast',function(){$(this).remove();});
                                });
}

var quiz={
	init:function(){
		var _this= this;
		this.cover= $('#cover');
		this.content = $('#content')
		this.end = $('#end');

		this.start = $('#start');
		this.question = $('#question');
		this.option_list = $('.options-list');
		this.options = $('.option');
		this.finalInfoBox = $('#myInfo');
		this.quizIndex = $('#quizIndex');
		this.timeOut=null;

		this.quizQuestions =allQuestion;
		this.finalRelation = finalRelation;
		this.questionLength =this.quizQuestions.length;	//total length of all questions;
		
		this.needLength = 6;	//set quiz length;
		this.quizQuest = [];

		this.curQuest = null;
		this.curQuestIndex =0;

		this.zhuyuArr = [];
		this.zhuyuCount = [];
		this.news = [];// store relative news; 
		this.finalZhuyu = '';	
		this.finalResult = '';
		this.url = 'http://121.42.52.51/quiz/2014/yx2015/count.php';


		window.isMobile = (navigator['userAgent'].toLowerCase()).match(/iphone|ipad|android/ig);
		window.isWeixin = (navigator['userAgent'].toLowerCase()).match(/MicroMessenger/ig);
		this.getWxConfig();
		
		this.start.on('touchend mouseup',function(event){
			event.preventDefault()
			event.stopPropagation();
			_this.cover.fadeOut('normal',function(){
				_this.content.show();
			});
			_this.getQuest();
			_this.loadQuest(_this.quizQuest[_this.curQuestIndex]);
		})
	},
	getWxConfig:function(){		
		var wxShareUrl = 'http://121.42.52.51/wxShare/jssdk.php';
		var pageUrl = location.href;
		$.post(wxShareUrl, {url:pageUrl}, function(data, textStatus, xhr) {
			if(data){
				data =JSON.parse(data);
				weiXinConfig.debug = false;
				weiXinConfig.appId = data["appId"];
				weiXinConfig.timestamp = data.timestamp;
				weiXinConfig.nonceStr = data.nonceStr;
				weiXinConfig.signature = data.signature;
				weiXinConfig.jsApiList = ['onMenuShareTimeline','onMenuShareAppMessage']
				wx.config(weiXinConfig);
			}
		});
	this.socialShare(false);
	},
	getQuest:function(){
		var _this= this;
	  	var randTotalLength =this.randNum(this.questionLength);// rand all questions;
	  	this.quizQuest = randTotalLength.slice(0, this.needLength); //get need length of all questions;
		this.quizQuest.forEach(function(ele){
			_this.news.push(_this.quizQuestions[ele]['news']);
		});
	},
	randNum:function(size){
	 	var arr1 = arr2 = [];
	 	for (var i = 0 ; i<size ;i++ ){
	  		arr1[i] = i;
	 	}
	 	for (var i = 0 ; i<size ;i++){
	  	arr2.push((arr1.splice(Math.floor(Math.random()*arr1.length) , 1))[0]);
	  }
	  return arr2;
	},
	loadQuest:function(index){
		var _this= this;
		var randOptionsArr = this.randNum(4); //rand cur question's option;
		this.options.removeClass('on');
		this.options.off('touchend mouseup');	
		this.quizIndex.html((this.curQuestIndex+1)+'/'+this.needLength);
		this.curQuest = this.quizQuestions[index];		
		
		var firstP = $('.question p:nth-child(1)'),
			secondP = $('.question p:nth-child(2)').html(this.curQuest.question);

		_this.curQuestIndex%2?this.option_list.addClass('active'):this.option_list.removeClass('active');
		
		firstP.animate({
			top: '25px',
			opacity: 0},
			'slow', function() {
			$(this).remove();
			secondP.animate({top: '10px', opacity: 1}, 'slow',function(){
				_this.question.append('<p></p>');
			});
		});

		this.options.each(function(k){
			var i = randOptionsArr[k];
			var letter='';
			var questionInLi=_this.curQuest.options[0]['option'+i];
			switch (k)
			{
				case 0: letter='A';break;
				case 1: letter='B';break;
				case 2: letter='C';break;
				case 3: letter='D';break;
			}
			var questionCon ='<span class="q-letter">'+letter+'</span><span class="q-con">'+questionInLi+'</span>';
			_this.curQuestIndex%2?$(this).find('.back p').html(questionCon):$(this).find('.front p').html(questionCon);
			
			$(this).attr('data-zhuyu',_this.curQuest.persons[0]['person'+i]);
			;
		});

		this.checkZhuyu();
	},
	checkZhuyu:function(optionIndex){
		var _this= this;
		
		this.options.on('touchend mouseup',function(event){
			event.preventDefault()
			event.stopPropagation();
			_this.options.off('touchend mouseup');
			var $this = $(this).addClass('on'),
				zhuyu = $this.attr('data-zhuyu');

			if($.inArray(zhuyu, _this.zhuyuArr)<0){
				_this.zhuyuArr.push(zhuyu);
				_this.zhuyuCount.push(1);
			}
			else{
				var zhuyuIndex = $.inArray(zhuyu, _this.zhuyuArr);
				_this.zhuyuCount[zhuyuIndex] = _this.zhuyuCount[zhuyuIndex]+1;
			}
			_this.curQuestIndex++;
			if(_this.curQuestIndex>=_this.needLength){
				_this.quizEnd();
			}
			else{
				_this.timeOut = setTimeout(function(){_this.loadQuest(_this.quizQuest[_this.curQuestIndex]);},800);
			}
		})		
	},                                                                                                                                                                                                                                                                                     
	quizEnd:function(){
		var _this= this;
		clearTimeout(this.timeOut);

		this.news.forEach(function(ele){
			$('#newsLi').append('<p>'+ele+'</p>');
		});

		this.content.fadeOut('slow');
		this.end.fadeIn('slow',function(){
			$('.newsBox').animate({opacity: 1, bottom: '15px'}, 'slow',function(){
				$('.newsBox,.newsClose').on('click',function(){
					$('.newsBox').animate({
						opacity: 0,
						bottom: '0px'},
						'slow', function() {
						$(this).css('display','none');
						_this.end.hasClass('show')?'':_this.end.addClass('show');
					});
				});
			})
		});

		$('.checkNews').on('click',function(){
			$('.newsBox').css('display','block').animate({opacity: 1, bottom: '15px'}, 'slow');
		});

		this.getMaxName();
		
		this.finalInfoBox.html('<p>澎湃对我说：</p><p>'+this.finalResult+'</p>');
		this.options.off('touchend mouseup');
		this.socialShare(true);
	},
	getMaxName:function(){
		var _this = this;
		var max = maxIndex= 0;
		for(var i = 0; i < this.zhuyuCount.length; i++){  
            if(max < this.zhuyuCount[i]){  
                    max =  this.zhuyuCount[i];
                }     
            } 
        maxIndex = $.inArray(max,this.zhuyuCount);

        var finalZhuyu = this.zhuyuArr[maxIndex];

        this.finalRelation.forEach(function(ele){
        	if (ele.zhuyu == finalZhuyu){
        		_this.finalResult = ele.result;
        	}
        })

	},
	socialShare:function(flag){
		var _this = this;
	    var share_title,
	    directory = location.origin+location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    	
        if(flag){
            share_title = '澎湃对我说：'+this.finalResult;
        }else{
            share_title = '新年快乐！恭喜发财！万事如意！做几道题，测测运势！';
        }

        window.shareData = {
            "imgUrl": directory+"/wxshare.jpg",//分享的图片地址
            "link": location.href,//分享的页面地址
            "title": share_title,//分享标题
            "desc": "2014-2015 运气总是留给那些关心新闻的人。"//分享简介
        }; 
		//微博分享配置
		window.jiathis_config = {
		    data_track_clickback:true,
		    hideMore:true,
		    title:window.shareData.title,
		    summary:window.shareData.desc,
		    pic:window.shareData.imgUrl,
		    url:window.shareData.link,
		    appkey:{"tsina":"1918686509",
		            "tqq":"1a19d5534ef00089838fea7b03410e22",
		            }
			};
			wxshare();          
	}	
}
quiz.init();

 //set weixin share show or hide in different device or app;
if(isMobile){
    if(isWeixin){
        weixin_share.parent().remove();
        $('.s-title').after('<span class="s-span"><a class="paper-weixin"><span></span></a></span>');       
    	$('.paper-weixin').on('click',function(){addWeixinTip();});
    }else{
        weixin_share.css('display','none');
    }
}

//when mobile device orientation change show/hide the turn-box;
window.onorientationchange = function(){
    if(window.orientation==90||window.orientation==-90){
        $('#turn-box').css({'display':'block','opacity':1});
        $('.container').css('display','none');
    }else {
        $('.container').css('display','block');
        setTimeout(function(){
            $('#turn-box').animate({'opacity':0},500,function(){
                $(this).css('display','none')
            });
        },1000);
    }
}


})
