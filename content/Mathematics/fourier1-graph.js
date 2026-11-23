
    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function setUpTangle () {

        var freq_elem = document.getElementsByClassName("main")[0];

        var canvas = document.getElementById("graph0");
        const ctx = canvas.getContext("2d");
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        var canvas2 = document.getElementById("graph1");
        const ctx2 = canvas2.getContext("2d");
        canvas2.width  = canvas2.offsetWidth;
        canvas2.height = canvas2.offsetHeight;


        var tangle = new Tangle(freq_elem, {
            initialize: function () {
                this.f0 = 135.0;
                this.fs = 50.0;
                this.zoh = false;

                this.fs_symin = 50.0;
                this.f0_symin = 135.0;
                this.n_symin = 4;
                this.stick = false;
                
                this.fs_asymin = 50.0;
        
                var sendto_btn = document.getElementById("symin-send");

                var click_fun = function() {
                    tangle.setValue("fs", Number(tangle.getValue("fs_symin")));
                    tangle.setValue("f0", Number(tangle.getValue("f0_symin")));
                }
               
                sendto_btn.onclick = click_fun.bind(this);


                var sendto_btn_asym = document.getElementById("asymin-send");

                var click_fun_asym = function() {
                    tangle.setValue("fs", Number(tangle.getValue("fs_asymin")));
                    tangle.setValue("f0", Number(tangle.getValue("f0_symin")));
                }
                
                sendto_btn_asym.onclick = click_fun_asym.bind(this);
                var self = this;
                document.addEventListener('themechange', function () {
                    self.update_graph();
                });
            },

            update: function() {
                this.f0 = Math.max(this.f0, 1);
                this.fs = Math.max(this.fs, 1);
                this.f0_symin = Math.max(this.f0_symin, 1);
                this.n_symin = Math.max(this.n_symin, 1);

                this.fs_symin = (2.0 / (2.0 * Number(this.n_symin) - 1) * Number(this.f0_symin)).toFixed(2);
                
                this.fs_asymin = (4.0 / (2.0 * Number(this.n_symin) - 1) * Number(this.f0_symin)).toFixed(2);

                this.fs_symin = Math.max(this.fs_symin, 1);
                this.fs_asymin = Math.max(this.fs_asymin, 1);

                if(this.stick) {
                    document.getElementById("stick").classList.add("sticky");
                } else {
                    document.getElementById("stick").classList.remove("sticky");   
                }
                
                this.update_graph();
            },

            update_graph: function () {
                const zeroff = 0.8;
                const linesize = 100.0;
                const marksize = 10.0;

                const inkColor       = cssVar('--ink');
                const inkFaintColor  = cssVar('--ink-faint');
                const blueColor      = cssVar('--blue');
                const amberColor     = cssVar('--amber');
                const inkRgb         = cssVar('--ink-rgb');
                const inkFaintOverlay = 'rgba(' + inkRgb + ', 0.7)';

                ctx.strokeStyle = inkColor;
                ctx.fillStyle = inkColor;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Axes
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * zeroff);
                ctx.lineTo(canvas.width, canvas.height * zeroff);
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.stroke();

                // Hz / pixel
                const scale = 0.5;
                const step = 50.0;
                const substep = 10.0
                const span = Math.ceil(canvas.width / 2 * scale / step) * step;


                ctx.fillStyle = 'rgba(' + inkRgb + ', 0.08)';
                nyq0 = -this.fs / scale * 0.5 + canvas.width * 0.5;
                nyq = this.fs / scale;
                ctx.beginPath();
                ctx.rect(nyq0, 0, nyq, canvas.height);
                ctx.fill();
                
                ctx.fillStyle = inkColor;

                ctx.beginPath();
                ctx.strokeStyle = inkFaintColor;
                ctx.font = "10px sans"

                const sincmax = (20 * Math.log10(1.0 / this.fs) + 100.0);

                for(var f = -span; f < span; f += step) 
                {
                    x = f / scale + canvas.width * 0.5;
                    ctx.moveTo(x, canvas.height * zeroff - 5.0);
                    ctx.lineTo(x, canvas.height * zeroff + 5.0);
                    ctx.fillText(f, x, canvas.height * zeroff + 14.0);
                }
                
                for(var f = -span; f < span; f += substep) 
                {
                    x = f / scale + canvas.width * 0.5;
                    ctx.moveTo(x, canvas.height * zeroff - 3.0);
                    ctx.lineTo(x, canvas.height * zeroff + 3.0);
                }

                ctx.stroke();

                ctx.strokeStyle = blueColor;
                ctx.beginPath();
                const maxn = 50;
                for(var n = -maxn; n < maxn; n++) 
                {
                    var fac1 = 1.0;
                    var fac2 = 1.0;
                    var f1 = n * this.fs + this.f0;
                    var f2 = n * this.fs - this.f0;
                    var x1 = f1 / scale + canvas.width * 0.5;
                    var x2 = f2 / scale + canvas.width * 0.5;

                    if(this.zoh) {
                       fac1 = Math.abs(Math.sin(f1 * Math.PI * 1.0 / this.fs) / (Math.PI * f1));
                       fac2 = Math.abs(Math.sin(f2 * Math.PI * 1.0 / this.fs) / (Math.PI * f2));

                       fac1 = Math.max(20 * Math.log10(fac1) + 100.0, 0) / sincmax;
                       fac2 = Math.max(20 * Math.log10(fac2) + 100.0, 0) / sincmax;
                    }

                    ctx.moveTo(x1, canvas.height * zeroff);
                    ctx.lineTo(x1, canvas.height * zeroff - linesize * fac1);
                    ctx.moveTo(x2, canvas.height * zeroff);
                    ctx.lineTo(x2, canvas.height * zeroff - linesize * fac2);
                }
                
                ctx.stroke();
                
                ctx.strokeStyle = amberColor;
                ctx.fillStyle = amberColor;

                ctx.beginPath();
                var x0 = this.f0 / scale + canvas.width * 0.5;
                var x0p = -this.f0 / scale + canvas.width * 0.5;
                ctx.moveTo(x0, canvas.height * zeroff - linesize);
                ctx.lineTo(x0, canvas.height * zeroff - linesize - marksize);
                ctx.moveTo(x0p, canvas.height * zeroff - linesize);
                ctx.lineTo(x0p, canvas.height * zeroff - linesize - marksize);
                ctx.stroke();

                ctx.fillText(this.f0, x0, canvas.height * zeroff - linesize - marksize);
                ctx.fillText(-this.f0, x0p, canvas.height * zeroff - linesize - marksize);
                    
                ctx.strokeStyle = inkFaintOverlay;
                ctx.beginPath();
                if(this.zoh) {
                    ctx.moveTo(0, 0);
                    for(var x = 0; x < canvas.width; x++)
                    {
                        var f = (x - canvas.width * 0.5) * scale 
                        var fac = Math.abs(Math.sin(f * Math.PI * 1.0 / this.fs) / (Math.PI * f));
                        fac = Math.max(20 * Math.log10(fac) + 100.0, 0) / sincmax;

                        ctx.lineTo(x, canvas.height * zeroff - linesize * fac);
                    }
                }
                ctx.stroke();

                // TIME PLOT
                /////////////////////////

                ctx2.strokeStyle = inkColor;
                ctx2.fillStyle = inkColor;
                ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

                // Axes
                ctx2.beginPath();
                ctx2.moveTo(0, canvas2.height * zeroff);
                ctx2.lineTo(canvas2.width, canvas2.height * zeroff);
                ctx2.stroke();

                const tscale = 0.0005; // s / pixel


                ctx2.strokeStyle = inkFaintOverlay;

                ctx2.beginPath();
                ctx2.moveTo(0, 0);

                for(var x = 0; x < canvas2.width; x++)
                {
                    var t = x * tscale;
                    var or = (Math.cos(2.0 * Math.PI * this.f0 * t) + 1.0) * 0.5;
                    ctx2.lineTo(x, canvas2.height * zeroff - or * 100.0);
                }
                ctx2.stroke();

                ctx2.strokeStyle = blueColor;

                ctx2.beginPath();
                if(this.zoh)
                {
                    ctx2.moveTo(0, 0);
                }

                if(this.f0 != 0)
                {
                    var prevy = 0.0;
                    for(var t = 0; t < tscale * canvas2.width + 1.0 / this.fs; t+=(1.0 / this.fs))
                    {
                        var x = t / tscale;
                        if(this.zoh) {
                            x = (t - 0.5 / this.fs) / tscale;
                        }
                        var ors = (Math.cos(2.0 * Math.PI * this.f0 * t) + 1.0) * 0.5;
                        var y = canvas2.height * zeroff - ors * 100.0;

                        if(this.zoh) 
                        {
                            ctx2.lineTo(x, prevy);
                            ctx2.lineTo(x, y);
                            prevy = y;
                        }
                        else
                        {
                            ctx2.moveTo(x, canvas2.height * zeroff);
                            ctx2.lineTo(x, y);
                        }
                    }
                    ctx2.stroke();
                }

            }
        });
    }

    window.onload = setUpTangle

