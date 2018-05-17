$(document).ready(() => {
    // Khai báo biến toàn cục
    var step, // Lưu số bước của khung hình
        img, // Số thứ tự ảnh để thay đổi cho nhân vật đang chạy
        lane, // Làn đang chạy hiện tại
        jump, // Bằng true có nghĩa là nhân vật đang nhảy trên không và ngược lại
        win, // Trạng thái trò chơi, 0 => Đang chơi, -1 => Đã thua, 1 => Chiến thắng
        obs, // Vị trí vật các cản
        size, // Chiều rộng của mỗi địa danh
        place, // Lưu lại các phần tử HTML để không phải Query nhiều, giúp tăng hiệu suất trò chơi (Các địa danh)
        box, // Lưu lại các phần tử HTML để không phải Query nhiều, giúp tăng hiệu suất trò chơi (Các hộp thoại)
        runner; // Lưu lại các phần tử HTML để không phải Query nhiều, giúp tăng hiệu suất trò chơi (Đối tượng runner)

    // Hàm khởi tạo giá trị ban đầu
    var initData = () => {
        step = 0;
        img = 1;
        lane = 2;
        jump = false;
        win = 0;
        size = 804;

        obs = {
            l1: [Math.round((Math.random() * 1750) + 500), Math.round((Math.random() * 1750) + 500)],
            l2: [Math.round((Math.random() * 1750) + 500), Math.round((Math.random() * 1750) + 500)],
            l3: [Math.round((Math.random() * 1750) + 500), Math.round((Math.random() * 1750) + 500)]
        }

        place = {
            amazon: document.querySelector('#amazon'),
            bahia: document.querySelector('#bahia'),
            parana: document.querySelector('#parana'),
            saopaulo: document.querySelector('#saopaulo'),
            rio: document.querySelector('#rio'),
            amazonPanel: document.querySelector('#amazonPanel'),
            bahiaPanel: document.querySelector('#bahiaPanel'),
            paranaPanel: document.querySelector('#paranaPanel'),
            saopauloPanel: document.querySelector('#saopauloPanel'),
            rioPanel: document.querySelector('#rioPanel')
        }

        box = {
            end: document.querySelector('#end'),
            success: document.querySelector('#end .success'),
            error: document.querySelector('#end .error')
        }

        runner = {
            out: $('#runner'),
            in: $('#runner>img')
        }

        // Tạo mã HTML của các vật cản và đưa vào DOM
        var template = '<span class="obstacle" style="margin-left: %px;">#</span>'
        for (e in obs) {
            var DOM = '#';
            for (var i = 0; i < obs[e].length; i++) {
                DOM = DOM.replace('#', template).replace('%', obs[e][i]);
            }
            DOM = DOM.replace('#', '');
            $(`#runway${e.charAt(e.length - 1)}`).html(DOM);
        }

        place.amazon.className = 'hidden1';
        place.bahia.className = 'hidden2';
        place.parana.className = 'hidden3';
        place.saopaulo.className = 'hidden4';
        place.rio.className = 'hidden5';
        place.amazonPanel.className = 'hidden1';
        place.bahiaPanel.className = 'hidden2';
        place.paranaPanel.className = 'hidden3';
        place.saopauloPanel.className = 'hidden4';
        place.rioPanel.className = 'hidden5';
        document.querySelector('#pyre').className = 'hidden';
        $('#pyre>img').attr('src', 'imgs/pyre.svg');
    }

    initData();

    // Vòng lặp trong game
    var startButton = () => {
        setTimeout(() => {
            // Thay đổi thuộc tính CSS left giúp di chuyển nhân vật
            var e = runner.out;
            var l = e.css('left');
            l = parseInt(l.replace('px', ''));
            l += 10;
            e.css('left', l);

            // Di chuyển thanh Scrollbar ngang đi theo nhân vật
            var w = $(window).width() / 2;
            if (l > w) {
                window.scrollBy(10, 0);
            }

            // Thay đổi hình ảnh tương ứng khi nhân vật đang chạy hoặc nhảy
            // Biến step giúp cho việc thay đổi hình ảnh không quá nhanh, chỉ thay đổi khi đạt đủ 5 frame
            // Ngoài ra giúp giữ cho nhân vật nhảy trên không trong 20 frame
            if ((step == 5) && !jump || (step == 20 && jump)) {
                img = (img < 4) ? img + 1 : 1;
                runner.in.attr('src', `imgs/runner_${img}.png`);
                step = 0;
                jump = false;
            } else {
                step++;
            }

            // Di chuyển nhân vật lên cao khi gần tới đích do đường chạy thay đổi
            if (l >= 4750) {
                var b = e.css('bottom');
                b = parseInt(b.replace('px', ''));
                b += 5;
                e.css('bottom', b)
            }

            // Xử lý việc hiển thị các địa danh khi nhân vật chạm tới mỗi địa danh
            if (l >= size && l < size * 2) {
                place.amazon.className = 'visible1';
                place.amazonPanel.className = 'panel visible1';
            } else if (l >= size * 2 && l < size * 3) {
                place.bahia.className = 'visible2';
                place.bahiaPanel.className = 'panel visible2';
            } else if (l >= size * 3 && l < size * 4) {
                place.parana.className = 'visible3';
                place.paranaPanel.className = 'panel visible3';
            } else if (l >= size * 4 && l < size * 5) {
                place.saopaulo.className = 'visible4';
                place.saopauloPanel.className = 'panel visible4';
            } else if (l >= size * 5 && l < size * 6) {
                place.rio.className = 'visible5';
                place.rioPanel.className = 'panel visible5';
            }

            // Xác định nhân vật va chạm với các vật cản
            for (var i = 0; i < obs[`l${lane}`].length; i++) {
                var left = (i > 0) ? obs[`l${lane}`][i - 1] : 0;
                if (l >= obs[`l${lane}`][i] + left - 90 && l <= obs[`l${lane}`][i] + left + 30 && !jump) {
                    win = -1;
                    box.end.className = '';
                    box.success.className = 'success hide';
                }
            }

            if (l <= 5000 && win == 0) {
                // Khi nhân vật chưa tới đích thì tiếp tục vòng lặp trong game
                startButton();
            } else if (l > 5000 && win == 0) {
                // Khi chạm đích thì ngừng chò chơi lại
                document.querySelector('#pyre').className = 'visible';
                runner.in.attr('src', 'imgs/runner.svg');
                setTimeout(() => {
                    $('#pyre>img').attr('src', 'imgs/pyre_fire.svg');
                }, 1000);
                setTimeout(() => {
                    box.end.className = '';
                    box.error.className = 'error hide';
                }, 2000);
                win = 1;
            }
        }, 18)
    }

    // Xử lý khi nhấn vào Start Button
    $('#startButton').click((e) => {
        window.scrollTo(0, 0);
        startButton();
    })

    // Xử lý khi nhấn vào Restart Button
    $('#restartButton').click((e) => {
        // Khởi tạo lại các giá trị trong game về ban đầu
        initData();
        window.scrollTo(0, 0);
        box.end.className = 'hide';
        box.success.className = 'success';
        box.error.className = 'error';
        var e = runner.out;
        var eImg = runner.in;
        e.css({ left: 0, bottom: 100 });
        eImg.css('transform', 'none');
        // Bắt đầu vòng lặp game
        startButton();
    })

    // Xử lý sự kiện khi nhấn nút lên, xuống, spacebar
    $(window).keydown((e) => {
        var kC = e.keyCode;
        if (win == 0) {
            if (kC == 38 || kC == 40) {
                // Chuyển làn chạy
                var preLane = lane;
                if (kC == 38) {
                    lane = (lane > 1) ? lane - 1 : 1;
                } else if (kC == 40) {
                    lane = (lane < 3) ? lane + 1 : 3;
                }

                // Thay đổi vị trí nhân vật giữa các làn chạy và scale khi ở xa hoặc gần
                var e = runner.out;
                var eImg = runner.in;
                var b = e.css('bottom');
                b = parseInt(b.replace('px', ''));
                switch (lane) {
                    case 1:
                        if (preLane != 1) {
                            b += 20;
                            eImg.css('transform', 'scale(0.8) translateY(10%)');
                        }
                        break;
                    case 2:
                        b = (preLane == 1) ? b -= 20 : b += 30;
                        eImg.css('transform', 'none');
                        break;
                    case 3:
                        if (preLane != 3) {
                            b -= 30;
                            eImg.css('transform', 'scale(1.2) translateY(-10%)');
                        }
                        break;
                }
                e.css('bottom', b);
            } else if (kC == 32 && jump == false) {
                // Xử lý khi nhân vật nhảy lên
                runner.in.attr('src', 'imgs/runner1.svg');
                step = 0;
                jump = true;
            }
        }
    })
})