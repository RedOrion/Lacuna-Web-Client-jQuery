define(['jquery', 'lacuna', 'empire', 'template', 'zebra_cookie', 'mapStars', 'panel'],
function($, Lacuna, Empire, Template, Z, MapStars, Panel) {

    Template.load(['login']);
    var empireName = $.cookie.read('lacuna-expanse-empire-name') || '';
    var empirePassword;

    function Login() {
        // Helper for jQuery's weird scope management.
        var scope = this;

        this.build = function() {

            // Build the Login Panel.
            scope.panel = Panel.newTabbedPanel({
                name: 'Welcome', // Could someone please come up with something more creative?
                tabs: [
                    {
                        name        : 'Login',
                        content     : Template.read.login_main_tab({
                            empire_name : empireName
                        })
                    },
                    {
                        name: 'Create Empire',
                        content: Template.read.login_create_empire_tab({

                        })
                    },
                    {
                        name: 'Forgot Password?',
                        content: Template.read.login_forgot_password_tab({
                            
                        })
                    }
                ]
            });

            // Add the login event handlers.
            $('#empire, #password').keydown(function(event) {
                // Check if the 'enter' key was hit.
                if (event.which === 13) {
                    scope.login();
                }
            });

            $('#loginButton').click(scope.login);
        };

        this.login = function() {
            empireName      = $('#empire').val();
            empirePassword  = $('#password').val();
            Lacuna.showPulser();

            Lacuna.send({
                module: '/empire',
                method: 'login',

                params: [
                    empireName,
                    empirePassword,
                    'anonymous' // API Key
                ],

                success: function(o) {
                    Lacuna.hidePulser();

                    // Pop the empire name into a cookie.
                    Lacuna.setSession(o.result.session_id);

                    if ($('#rememberEmpire').prop('checked')) {
                        $.cookie.write('lacuna-expanse-empire-name', empireName, 365 * 24 * 60 * 60); // 1 year.
                    }
                    else {
                        $.cookie.destroy('lacuna-expanse-empire-name');
                    }
                    
                    // This kicks things off for the first time. The response is monitored in lacuna.js
                    // and callbacks are made to update the planet view and menus
                    Lacuna.send({
                        module  : '/body',
                        method  : 'get_status',
                        params  : [
                            o.result.session_id,
                            Lacuna.status.empire.home_planet_id,
                        ],
                        success: function() {
                            scope.panel.close();
                            // Log in to the planet view
                            $('#gameHeader, #gameFooter, #buildingsParent').css('visibility', 'visible');
                            $('#starsParent').css('visibility', 'hidden');
                        }
                    });
                },
                scope: this
            });
        }
    }

    return new Login();
});
