let loadingRender = (function ($) {
    let $loadingBox = $('.loadBox'),
        $run = $('.run');
    //=>我们需要的图片
    let imgList = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];
    //=>控制图片加载速度
    let total = imgList.length,
        cur = 0;
    let computed = function () {

        imgList.forEach(function (item) {
            let tempImg = new Image;
            tempImg.src = item;
            tempImg.onload = function () {
                cur++;
                tempImg = null;
                runFn();
            }
        });
    };
    //=>计算滚动条加载长度
    let runFn = function () {
        $run.css('width', cur / total * 100 + '%');
        if (cur >= total) {
            //=>需要延迟加载的都加载成功了：进入下一个区域(设置一个缓冲等时间，当加载完成
            let delayTimer = setTimeout(()=> {
                $loadingBox.remove();
                phoneRender.init();
                clearInterval(delayTimer);
            }, 2000)
        }
    };

    return {
        init: function () {
            //=>我们在css中把所有区域的DISPLAY都设置为none，以后开发的时候，开发那个区域，我们就执行那个区域的init方法，在这个方法中首先控制当前区域展示（开发那个区域，那个区域展示，其他区域都是隐藏的）
            $loadingBox.css('display', 'block');
            computed();
        }
    }
})(Zepto);
// loadingRender.init();

let phoneRender = (function ($) {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('.time'),
        $listen = $phoneBox.find('.listen'),
        $listenTouch = $listen.find('.touch'),
        $detail = $phoneBox.find('.detail'),
        $detailTouch = $detail.find('.touch');

    let audioBell = $('#audioBell')[0],
        audioSay = $('#audioSay')[0];

    let $phonePlan = $.Callbacks();
    //=>控制显示隐藏
    $phonePlan.add(function () {
        $listen.remove();
        $detail.css('transform', 'translateY(0)')
    });

    //=>控制SAY播放
    $phonePlan.add(function () {
        audioBell.pause();
        audioSay.play();
        $time.css('display', 'block');

        //=>即时计算播放时间
        let sayTimer = setInterval(()=> {
            //=>获取总时间和以及播放的时间：单位是秒
            let duration = audioSay.duration,
                currentTime = audioSay.currentTime;
            let minute = Math.floor(currentTime / 60),
                current = currentTime - minute * 60;
            let second = Math.floor(current);
            minute < 10 ? minute = '0' + minute : null;
            second < 10 ? second = '0' + second : null;
            $time.html(`${minute}:${second}`);

            //=>播放结束
            if (current >= duration) {
                clearInterval(sayTimer);
                enterNext();
            }

        }, 1000)
    });

    //=>detail-touch
    $phonePlan.add(function () {
        $detailTouch.tap(enterNext);
    });

    //=>进入下一个区域（message)
    let enterNext = function () {
        audioSay.pause();
        $phoneBox.remove();
        messageRender.init();
    };


    let listenTouch = function () {
        $listenTouch.tap($phonePlan.fire)
    };

    return {
        init: function () {
            $phoneBox.css('display', 'block');

            //=>控制被bell播放
            audioBell.play();
            audioBell.volume = 0.5;//控制音量
            // audioBell.pause;//控制暂停

            listenTouch();
        }
    }
})(Zepto);
// phoneRender.init();

let messageRender = (function ($) {
    let $messageBox = $('.messageBox'),
        $talkBox = $messageBox.find('.talkBox'),
        $talkList = $talkBox.find('li'),
        $keyBord = $messageBox.find('.keyBord'),
        $keyBordText = $keyBord.find('span'),
        $submit = $keyBord.find('.submit'),
        $musicAudio = $messageBox.find('#musicAudio');
    let $plan = $.Callbacks();

    //=>控制消息列表逐条显示
    let step = -1,
        autoTimer = null,
        interval = 1500,
        offset = 0;
    $plan.add(()=> {
        autoTimer = setInterval(()=> {
            step++;
            let $cur = $talkList.eq(step);
            $cur.css({
                opacity: 1,
                transform: 'translateY(0)',
            });
            //=>当第三条完全展示之后立即调取出键盘（step===2&&当前LI显示的动画已经显示完成)
            if (step === 2) {
                //=>transitionend:当前元素正在运行css3过度动画已经完成，就会触发这个事件（有几个元素样式需要改变就会触发几次）
                $cur.one('transitionend', ()=> {
                    // one:JQ中的事件绑定方法，类似于on，主要是想要实现当前事件只绑定一次，触发一次后给事件绑定的方法自动移除
                    $keyBord.css('transform', 'translateY(0)').one('transitionend', textMove);
                });
                clearInterval(autoTimer);
                return
            }

            //=>从第五条开始，每当展示一个li，都需要让UL真题上移
            if (step >= 4) {
                offset += -$cur[0].offsetHeight;
                $talkBox.css('transform', `translateY(${offset}px)`);
            }

            //=>已经把LI都展示了，结束动画进入下一个区域即可
            if (step >= $talkList.length - 1) {
                clearInterval(autoTimer);
                let delayTimer = setInterval(()=> {
                    $musicAudio[0].pause();
                    $messageBox.remove();
                    cubeRender.init();
                }, interval)
            }
        }, interval)
    });
    //=>控制文字及其打印机效果
    let textMove = function () {
        let text = $keyBordText.html();
        $keyBordText.css('display', 'block').html('');
        let timer = null,
            n = -1;
        timer = setInterval(()=> {
            if (n >= text.length) {
                clearInterval(timer);
                //=>打印机效果完成，让发送按钮显示(并且给发送按钮绑定点击事件）
                $keyBordText.html(text);
                $submit.css('display', 'block').tap(()=> {
                    $keyBordText.css('display', 'none');
                    $keyBord.css('transform', 'translateY(3.7rem)');
                    $plan.fire();//=>此时计划表中只有一个方法，所以重新执行即可
                });
                return;
            }
            n++;
            $keyBordText[0].innerHTML += text.charAt(n)
        }, 200)
    };

    return {
        init: function () {
            $musicAudio[0].play();
            $messageBox.css('display', 'block');
            $plan.fire();
        }
    }
})(Zepto);

/*CUBE*/
//=>只要在移动端浏览器中实现滑动操作，都需要把浏览器默认的滑动行为（例如：页卡切换等）禁止掉
$(document).on('touchstart touchmove touchend', function (e) {
    e.preventDefault();
});
let cubeRender = (function () {
    let $cubeBox = $('.cubeBox'),
        $box = $cubeBox.find('.box');

    let touchBegin = function (e) {
            //=>this:box
            let point = e.changedTouches[0];
            $(this).attr({
                strX: point.clientX,
                strY: point.clientY,
                isMove: false,
                changeX: 0,
                changeY: 0
            })

        },
        touching = function (e) {
            let point = e.changedTouches[0],
                $this = $(this);
            let changeX = point.clientX - parseFloat($this.attr('strX')),
                changeY = point.clientY - parseFloat($this.attr('strY'));
            if (Math.abs(changeX) > 10 || Math.abs(changeY) > 10) {
                $this.attr({
                    isMove: true,
                    changeX: changeX,
                    changeY: changeY
                });
            }
        },
        touchEnd = function (e) {
            let point = e.changedTouches[0],
                $this = $(this),
                isMove = $this.attr('isMove'),
                changeX = parseFloat($this.attr('changeX')),
                changeY = parseFloat($this.attr('changeY')),
                rotateX = parseFloat($this.attr('rotateX')),
                rotateY = parseFloat($this.attr('rotateY'));
            if (isMove === 'false')return;
            rotateX = rotateX - changeY / 3;
            rotateY = rotateY + changeX / 3;
            $this.css(`transform`, `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`).attr({
                rotateX: rotateX,
                rotateY: rotateY
            })
        };
    return {
        init: function () {
            $cubeBox.css('display', 'block');

            $box.attr({
                rotateX: -30,
                rotateY: 45
            }).on({
                touchstart: touchBegin,
                touchmove: touching,
                touchend: touchEnd
            });

            //=>每一个页面的点击事件
            $box.find('li').tap(function () {
                $cubeBox.css('display', 'none');
                let index = $(this).index();
                detailRender.init(index);

            })
        }
    }
})();

/*DETAIL*/
let detailRender = (function () {
    let $detailBox = $('.detailBox'),
        $returnLink = $detailBox.find('.returnLink'),
        $cubeBox = $('.cubeBox'),
        $makisuBox = $('#makisuBox');
    swiperExample = null;

    let change = function (example) {
        // example.activeIndex//=>当前活动块的索引
        //        example.slides//=>数组，存储了当前所有活动块
        //    example.slides[example.activeIndex]//=>当前活动块
        let {slides:slideAry, activeIndex:activeIndex}=example;
        //=>PAGE1单独处理
        if (activeIndex === 0) {
            $makisuBox.makisu({
                selector: 'dd',
                overlap: 0.2,
                speed: 0.5
            });
            $makisuBox.makisu('open')
        } else {
            $makisuBox.makisu({
                selector: 'dd',
                overlap: 0,
                speed: 0
            });

            //=>给当前活动块设置ID，其他块移除ID


            $makisuBox.makisu('close')
        }
        [].forEach.call(slideAry, (item, index)=> {
            if (index === activeIndex) {
                item.id = 'page' + (activeIndex + 1);
                return;
            }
            item.id = null;
        });

    };

    return {
        init: function (index) {
            $detailBox.css('display', 'block');


            if (!swiperExample) {
                $returnLink.tap(()=> {
                    $detailBox.css('display', 'none');
                    $cubeBox.css('display', 'block');

                });
                //实例不存在的情况下，我们初始化，如果已经初始化过了，下一次直接运动到对应的位置即可，不需要重新初始化
                swiperExample = new Swiper('.swiper-container', {
                    // loop:true,//=>如果我们采用的切换效果是3D的，最好不要设置无缝衔接循环切换，在部分安卓机下swiper这块的处理是有bug的
                    effect: 'coverflow',
                    onInit: change,
                    onTransitionEnd: change
                });
            }
            index = index > 5 ? 5 : index;
            swiperExample.slideTo(index, 0)
        }
    }
})();
detailRender.init();

/*
 *  基于SWIPER实现每一个页面的动画
 * 1、滑到某一个页面的时候，给当前这个页面设置一个ID，例如：滑动到第二个页面，我们给其设置ID=PAGE2
 * 2、当滑出这个页面的时候，我们把之前设置的ID移除掉
 * 3、我们把当前元素中需要的动画效果全部写在指定的ID下
 *
 *#page2{
 * animation:xxx1s...
 * }
 *
 * 细节处理
 * 1、我们是基于animation.css帧动画库完成的动画
 * 2、我们让需要运动的元素初始样式：opacity=0（开始是隐藏的）
 * 3、当设置ID让其运动的时候，我们自己在动画公式完成的时候让其透明度为1
 */