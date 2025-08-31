jQuery(document).ready(function ($) {

    // Change tab class and display content
    $('.mxupload-nav-wrapper a').on('click', function (event) {
        event.preventDefault();
        $('.mxupload-nav-wrapper li').removeClass('active');
        $(this).parent('li').addClass('active');
        $('.mxupload-settings-content-area .tabs').hide();
        $($(this).attr('href')).show();
    });

    // Show the first tab by default
    $('.wrapper-stage div.wrapper').hide();
    $('.wrapper-stage div.wrapper:first').show();
    $('.wrapper-nav li:first').addClass('wrapper-active');

    // Change tab class and display content
    $('.wrapper-nav a').on('click', function (event) {
        event.preventDefault();
        $('.wrapper-nav li').removeClass('wrapper-active');
        $(this).parent().addClass('wrapper-active');
        $('.wrapper-stage div.wrapper').hide();
        $($(this).attr('href')).show();
    });

    // Toggle user role event.
    $('.custom-control-input').change(function () {
        var checkedValue = $('.custom-control-input:checked').val();

        if (checkedValue !== undefined) {
            $(".mxupload-size-wrapper .mxupload-size-settings").addClass('is-active');
            $(".bfsew_mxsetting_upload_size_all_user_format .upload_limit").prop('disabled', true);
            $(".bfsew_mxsetting_upload_size_all_user_format .bfs_mxsetting_upload_size_all_user_format").prop('disabled', true);
        } else {
            $(".mxupload-size-wrapper .mxupload-size-settings").removeClass('is-active');
            $(".bfsew_mxsetting_upload_size_all_user_format .upload_limit").prop('disabled', false);
            $(".bfsew_mxsetting_upload_size_all_user_format .bfs_mxsetting_upload_size_all_user_format").prop('disabled', false);
        }
    });

    function mxuploadChart(params) {
        // Get the data attributes
        let $wrapper = $(".mxupload-doughnut-wrapper");
        let fileLabels = JSON.parse($wrapper.attr('data-labels'));
        let fileColors = JSON.parse($wrapper.attr('data-colors'));
        let fileSizes = JSON.parse($wrapper.attr('data-sizes'));
        let totalFiles = $wrapper.attr('total-files');
        let totalStorage = $wrapper.attr('total-storage');

        // Data for the chart
        var data = {
            labels: fileLabels,
            datasets: [{
                data: fileSizes,
                backgroundColor: fileColors,
                hoverOffset: 4
            }]
        };

        // Custom plugin to draw text
        var customTextPlugin = {
            id: 'customText',
            afterDraw: function (chart) {
                var width = chart.width,
                    height = chart.height,
                    ctx = chart.ctx;

                ctx.restore();
                ctx.font = "18px Poppins";
                ctx.textBaseline = "middle";

                // Draw the title
                var text = "Total Value",
                    textX = Math.round((width - ctx.measureText(text).width) / 2),
                    textY = height / 2 - 10;
                ctx.fillText(text, textX, textY);

                // Draw the value
                ctx.font = "22px Poppins";
                var valueText = totalStorage + " / " + totalFiles,
                    valueTextX = Math.round((width - ctx.measureText(valueText).width) / 2),
                    valueTextY = height / 2 + 20;
                ctx.fillText(valueText, valueTextX, valueTextY);

                ctx.save();
            }
        };

        var ctx = document.getElementById('mxupload-doughnut-chart').getContext('2d');

        // Check if a chart instance already exists and destroy it
        if (window.myChart) {
            window.myChart.destroy();
        }

        var config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                radius: '100%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            },
            plugins: [customTextPlugin]
        };

        window.myChart = new Chart(ctx, config);
    }

    function mxuploadAjax(params) {
        let flagData = '';
        if (params !== 'undefined') {
            flagData = params;
        }
        $.ajax({
            type: 'POST',
            url: mxupload_ajax.ajax_url,
            data: {
                action: 'mxupload_file_scan',
                nonce: mxupload_ajax.nonce,
                flagData: flagData,
            },
            beforeSend: function () {
                $(".card-section").remove();
                $("#mxupload_storage_analysis .loader").css("display", "flex");
            },
            success: function (response) {
                let responseData = response.data.html_content
                if (responseData !== '') {
                    $("#mxupload_storage_analysis .mxupload-settings-content").append(response.data.html_content);
                    mxuploadChart();
                } else {
                    $("#mxupload_storage_analysis .mxupload-settings-content").append('<p class="error-text">Storage Analysis Data Not Found: We have unable to retrieve the storage analysis data at the moment. Please try again later.</p>');
                }


            },
            complete: function (params) {
                $("#mxupload_storage_analysis .loader").css("display", "none");
            }
        });
    }

    $(document).on('click', '.btn-generate-report', function (event) {
        event.preventDefault();
        let flag = $(this).attr('data-flag');
        mxuploadAjax(flag);
    });

    $(document).on('click', '.mxupload_storage_analysis ', function (event) {
        mxuploadChart();
    });

});

document.addEventListener('DOMContentLoaded', function() {
    // Get the current URL and parse the hash
    const hash = window.location.hash || '#mxupload_settings'; // Default to the settings tab
    const tabId = hash.substring(1); // Remove the '#'

    // Show the correct tab based on the hash
    const tabs = document.querySelectorAll('.tabs');
    const navItems = document.querySelectorAll('.mxupload-nav-wrapper li');

    tabs.forEach(tab => {
        if (tab.id === tabId) {
            tab.classList.add('active'); // Show active tab
        } else {
            tab.classList.remove('active'); // Hide inactive tab
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active'); // Reset all nav items
        if (item.querySelector('a').getAttribute('href') === hash) {
            item.classList.add('active'); // Highlight the active nav item
        }
    });

    // Add click event listeners to the nav items
    navItems.forEach(item => {
        item.addEventListener('click', function(event) {
            const newHash = this.querySelector('a').getAttribute('href');
            window.location.hash = newHash; // Update the URL with the new hash
        });
    });
});
