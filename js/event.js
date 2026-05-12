$(function () {
  listenScrollToSetHeader();
  listenToSetScrollTopBtn();
  listenToSetButtonClick();
});

function listenScrollToSetHeader() {
  const navbar = $('#navbar');
  $(window).scroll(() => {
    const dist = $(window).scrollTop();
    if (dist > 30) {
      navbar.addClass('nav-scrolled');
    } else {
      navbar.removeClass('nav-scrolled');
    }
  });
}

function listenToSetScrollTopBtn() {
  const scrollBtn = $('#scroll-to-top');
  if (scrollBtn.length === 0) return;

  const mainEl = $('#main');

  $(window).scroll(() => {
    const dist = $(window).scrollTop();
    if (dist > 120) {
      scrollBtn.fadeIn(300);
    } else {
      scrollBtn.fadeOut(300);
    }
  });

  const setScrollBtnPosition = () => {
    const mainRight = mainEl[0].getClientRects()[0].right;
    const bodyRight = $('body')[0].getClientRects()[0].right;
    const right = bodyRight - mainRight - 50;

    scrollBtn.css({
      'right': right + 'px',
      'bottom': right < 0 ? '-50px' : '120px'
    });
  };

  setScrollBtnPosition();

  $(window).resize(() => {
    setScrollBtnPosition();
  });

  scrollBtn.click(() => {
    $('html,body').animate({ scrollTop: 0 }, 100);
  });
}

function listenToSetButtonClick() {
  const menuBtn = $('#menu-btn');

  menuBtn.click(() => {
    $('.menu-icon').toggleClass('open');
  });

  const collapseMenu = document.getElementById('nav-menu');
  if (!collapseMenu) return;

  collapseMenu.addEventListener('show.bs.collapse', () => {
    $('nav').not('.nav-scrolled').css({
      'box-shadow': '0 2px 6px rgba(0, 0, 0, 0.5)'
    });
  });
  collapseMenu.addEventListener('hide.bs.collapse', () => {
    $('nav').not('.nav-scrolled').css({
      'box-shadow': 'none'
    });
  });
}
