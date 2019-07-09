(function () {
    'use strict';
    var scom;
    if(window.scom){
        scom = window.scom;
    }else{
        scom = window.scom = {};
    }
    scom.getNavElement = function() {
        const navElement = `
        <div class="col-md-12">
            <nav class="navbar navbar-expand-lg navbar-light bg-primary p-4">
            <span class="navbar-brand offset-md-2 uppercase font-weight-bold">smallcoderofme
            </span>
            <button class="navbar-toggler" type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
            <ul class="nav navbar-nav font-weight-bold">
            <li class="nav-item nav-size">
            <a class="nav-link text-dark" href="home.html">Home</a>
            </li>
            <li class="nav-item nav-size">
            <a class="nav-link text-dark" href="blog.html">Blog</a>
            </li>
            <li class="nav-item nav-size">
            <a class="nav-link text-dark" href="#">Concat</a>
            </li>
            </ul>
            </div>
            </nav>
            </div>`;
        return navElement;
    }

})();