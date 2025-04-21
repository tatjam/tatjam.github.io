Understanding undersampling - 1
2025-04-15
Using the Fourier transform and interactive graphics to intuitively understand undersampling transmitters

It's possible to generate nearly arbitrarily high frequency signals using a relatively slow transmitter by exploiting undersampling. In this post I will try to give an intuitive explanation of the mechanism, and try to find the optimum sample frequency to emit a given signal.

---


	

I found this [fascinating video](https://www.youtube.com/watch?v=eIdHBDSQHyw), which showcases the emission of LORA signals using nothing more than a GPIO on a microcontroller. Of course, the microcontroller cannot directly synthesize the radio frequency signal (at around 900MHz), so instead high harmonics of the GPIO square wave output are used. The mechanism to actually synthesize the signal is remarkable: sample the signal you want to emit at your desired GPIO frequency, and use that sampled data to drive your pin.

As a prerequisite for this article, you will need to know to have some familiarity with the Fourier transform and convolutions. Nonetheless, I've tried to make the article as intuitive as possible, of course nearly fully disregarding mathematical rigor.

# Sampling our signal

We will consider a really simple signal \\( g(t) = \cos (2 π f_0 t) = \frac{1}{2} e^{2 π f_0 t i} + \frac{1}{2} e^{-2 π f_0 t i} \\), which is the signal we want to emit from our device. An ideal sampling device would capture infinitely thin slices of the signal. Such slices have a vanishingly small quantity of energy, so the sampler needs greater and greater gain as we thin the slice. The mathematical symbol to represent such behavior is the Dirac delta \\(δ\\), which allows us to write the sampled signal as:

$$
    g_s(t) = g(t) \sum_{n=-∞}^{∞} δ(t - n T)
$$

Where \\( T \\) is the time between each sample being taken. 

If we take the Fourier transform [^1] of \\( g(t) \\) we find its spectrum \\( G(ω) \\), which also uses the Dirac delta:

[^1]: I'm using the unitary Fourier transform, which leads to neater expressions.

$$
    G(f) = \frac{1}{2} δ(f -  f_0) + \frac{1}{2} δ(f + f_0)
$$

## The spectrum of the sampled signal

To compute the spectrum of the sampled signal, we can apply the convolution theorem. It states that the Fourier transform of the product of two functions is the convolution of their respective Fourier transforms (the converse is also true). We can obtain the Fourier transform of the "sampling function" (Dirac comb) and find it to be:

$$
    \frac{1}{T} \sum_{n=-∞}^{∞} δ\left(f - \frac{n}{T}\right)
$$

Now, we need to convolve the previous expression with \\(G(ω)\\). The convolution of a Dirac delta with another obeys the following law: 

$$
    δ(t - a) ⊛ δ(t - b) = δ((a + b) - t) 
$$

Thus we may write the spectrum of the sampled signal by applying the previous "law" linearly:

$$
    G_s(f) = \frac{1}{2} \sum_{n=-∞}^{∞} δ\left(\left(\frac{n}{T} ± f_0\right) - f \right) 
$$

The following graph allows you to play around with the values and get a feel for the results. Note that the vertical scale of the graph represents the intensity of each term of the Fourier series in a logarithmic scale [^2], and the horizontal scale is the frequency in Hz. The shaded area represents the Nyquist area, where the signal frequency is less than half the sampling frequency.

[^2]: Actually, the signals are divided by the would-be intensity of the "DC" signal of \\( f = 0 \\) before taking logarithms, such that the graph scale remains consistent.

Consider \\( f_0 \\) = <input data-var="f0" class="DraggableNumber" size="4" style="width: 4em">Hz</input> 
and \\( \frac{1}{T} = f_s \\) = <input data-var="fs" class="DraggableNumber" size="4" style="width: 4em">Hz</input>. We obtain the spectrum:

<input data-var="zoh" class="Checkbox">(Enable zero-order hold in graph)</input>.

<div id="stick-enable" class="sticky">
<input data-var="stick" class="Checkbox">(Stick graph to screen)</input>.
</div>

<div id="stick" class="sticky" style="top:30px;">
<div id="graph-anchor" class="canvas-container" style="height: 10em">
<canvas id="graph0"></canvas>
</div>

<div class="canvas-container" style="height: 10em">
<canvas id="graph1"></canvas>
</div>
</div>


Sure enough, our original frequency is one of the components of the sampled signal. Note that if you reduce the signal frequency to within the Nyquist zone (grey area), the signal is perfectly reproduced within that area, without any spurious signal appearing.

# The zero-order hold

Our ideal sampling process can be easily achieved within a computer by sampling a mathematical representation of a signal. But, outputting such a signal from a microcontroller would prove impossible, as it would require generating infinitely fast pulses. A more realistic approximation is to state that we may generate a square-wave. For simplicity, we will assume that its edges are instantaneous. Mathematically, this is referred to as a zero-order hold. Feel free to play around with the button in the graph to get a feel for how it works.

We can represent such a device as a convolution in the time domain between our sampled signal and the "boxcar" function with the sample period as width:

<img src="./fourier1img/rect.svg" alt="Rectangle function" style="width: 40%"/>

Applying the convolution theorem, we can obtain the spectrum of the resulting signal as the product of the spectrum of the original samples, and of the spectrum of the "boxcar" function, which is known as the "sinc" function:

$$
    \frac{1}{π f} \sin \left(π \frac{f}{f_s} \right)
$$

Due to the denominator, the bigger \\( f \\) is, the more attenuation we have. Furthermore, if \\( f \\) is badly placed it may be completely attenuated. Note that, even with a properly sampled signal (i.e. sampling frequency more than twice the signal frequency), some attenuation will take place for signals relatively close to the Nyquist frequency (half the sampling frequency). This is commonly known as "sinc roll-off".

You can use the following button to enable this attenuation in the interactive graph:

<input data-var="zoh" class="Checkbox">(Enable zero-order hold in graph)</input>. <a href="#graph-anchor">Go to graph</a>


Each of the areas between two zeros is referred to as a "Nyquist zone". The zeroes can be found by solving \\( π \frac{f}{f_s} = kπ \\), which gives \\( f = k f_s \\), for \\( k ≥ 1 \\).

## A quick side-note: Extrema of the sinc function

If we compute the derivative of said function we can find the frequencies at which it's of maximum amplitude, which requires solving (for non-zero \\( f \\)):

$$
    \tan \left( \frac{π f}{f_s} \right) = \frac{π f}{f_s}
$$

Remarkably, this equation has no closed form solution. Nonetheless, we can infer some properties about its solutions, and cook up a quick numerical method to find them [^3]. First of all, note that it's intuitive to see that infinite solutions exist, as surely the line in the right hand side intersects the tangent (whose image spans all reals over and over) infinitely many times. 

Afterwards, note that taking the arc-tangent:

$$
    \frac{π f}{f_s} = \arctan \left( \frac{π f}{f_s} \right) + 2k π ⟹  f = \frac{f_s}{π} \left( \arctan \left( \frac{π f}{f_s} \right) + 2k π \right)
$$

Except for small \\( k \\), the term in the parenthesis is dominated by \\( 2k π \\). Furthermore, only one solution is located in each Nyquist zone, because the arc-tangent approaches \\( \frac{π}{2}  \\) as its argument grows, and is positive. In fact, for big enough \\( f \\) (and thus \\( k \\) ), the solution is located extremely close to \\( \frac{4k + 1}{2} f_s \\), at the center of each Nyquist zone. 

Thus, we propose a numerical method where start our iterative solution with \\( f[0] = 2k f_s \\), i.e. one of the zeroes of the sinc function, and iterate by the following recurrence relation:

$$
    f[n] = \frac{f_s}{π} \left( \arctan \left(\frac{π f[n - 1]}{f_s} \right) + 2 k π \right)
$$

Intuitively, this converges because \\( f[n - 1] \\) always underestimates the actual solution (as the arctangent is monotonic), and \\(f [n] \\) is also monotonically increasing with \\( n \\). A more detailed proof could be given, as this argument doesn't really show that the converged value is the actual solution, but goes outside the intent of the blog post. 5 iterations of this method are good enough for pretty much all applications.


[^3]: Adapted from [leonbloy's post on Mathematics Stack Exchange](https://math.stackexchange.com/q/18744).

Assuming that the maxima are located at the center of the Nyquist zones supposes a maximum error of around 0.5%, and thus for our application we may as well just assume that they are coincident.


# Optimum sampling frequency

We will consider the problem of finding the optimum sampling frequency to best represent \\( g(t) \\) with our sample-zero-order-hold system, given an upper limit on \\( f_s \\). This limit is usually imposed by the clock of the microcontroller's GPIO (General Purpose Input Output). By "best represent", we mean:

- Generating an output signal that contains as much power as possible in its spectrum at frequency \\( f_0 \\)
- Having the least possible cluttering signals around \\( f_0 \\) so we can use a wide band-pass filter to isolate our desired signal

Of course, if our \\( f_s \\) is large enough that it satisfies the Nyquist criterion, we can just output the signal "as-is", and apply a low-pass filter to eliminate higher order harmonics. We are instead interested in the case where \\( f_s \\) is relatively small.

## For emitting symmetric signals

If you play around with the graph, you will find that for signals "dancing" around a multiple of half \\( f_s \\), we get a symmetric signal of near-maximum gain, and furthest away from the other undesired harmonics. The maximum gain can be explaind intuitively: at a signal of half the sample-frequency, the output signal switches the most, and thus reasonably it contains the most energy at high frequencies [^4]. 

[^4]: Switching the signal is where the "high-frequency" of our output comes to life, as such a fast transition can "excite" arbitrarily high frequency resonant systems. This is precisely why a sampled 0 frequency signal (a constant), after applying the zero-order hold, has absolutely no high frequency content: it has no transitions.

Such signals are common in communications. For example, they could be used for carrier-supressed AM transmissions, as this type of signal is symmetric. Emitting a AM signal with carrier would be as simple as adding another signal at a multiple of half our sampling frequency.

Thus, if we want to emit a signal that's symmetric around a given \\( f_c \\), we need to set the sampling frequency to \\( \frac{2}{(2m - 1)} f_0 \\) where \\( m \\) is as big as needed.


Consider the center frequency of our symmetric signal to be \\( f_c \\) = <input data-var="f0_symin" class="DraggableNumber" size="4" style="width: 4em">Hz</input> 
and \\( m \\) = <input data-var="n_symin" class="DraggableNumber" size="2" style="width: 4em"></input>, the sample rate must be set to \\( f_s \\) = <a data-var="fs_symin"></a>Hz. 
<input id="symin-send" type="button" value="Send to graph"></input> <a href="#graph-anchor">Go to graph</a>


## For emitting non-symmetric signals

Non-symmetric signals are a bit more tricky to generate using this method. A good example of such signals are chirp-spread-spectrum methods, such as LORA, Frequency-Shift-Keying (FSK), and many other protocols used for digital data transfer. 

By playing around with the graph for a bit, you may also find that signals at odd multiples of a quarter the sampling frequency are optimally far away from the other harmonics. For example, if you set \\( f_0 = 125 \\)Hz and \\( f_s = 100 \\)Hz, and move around \\( f_0 \\), you will find this frequency maximizes the separation between signals, which are evenly spaced a distance of \\( \frac{f_s}{2} \\)Hz apart. 

Thus, if we want to emit a signal that's asymmetric but centered around a given \\( f_c \\), we need to set the sampling frqeuency to \\( \frac{4}{2m - 1} f_0 \\) where \\( m \\) is as big as needed.


If you only care about having the highest bandwidth without interference from other harmonics, this is the ideal sampling frequency. You could theoretically increase gain by a bit by exploiting the off-center nature of sinc maxima, but this effect is fairly small and for practical applications may as well be ignored.


Consider the center frequency of our non-symmetric signal to be \\( f_c \\) = <input data-var="f0_symin" class="DraggableNumber" size="4" style="width: 4em">Hz</input> 
and \\( m \\) = <input data-var="n_symin" class="DraggableNumber" size="2" style="width: 4em"></input>, the sample rate must be set to \\( f_s \\) = <a data-var="fs_asymin"></a>Hz. 
<input id="asymin-send" type="button" value="Send to graph"></input> <a href="#graph-anchor">Go to graph</a>


# Further non-idealities

During the whole text, we have considered that we can output any power level, but in reality we will be limited to outputting either zero power or maximum power. In the next post I will try to derive the effect of such a "distortion" on our signal. Indeed, this quantization will imply the appearance of a lot of distortion in the output signal, but our fundamental frequency will remain. Finally, I will present a real-life experiment where we put to test all of these mathematics in a device, and try to emit some meaningful radio waves.



<script type="text/javascript">

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

                ctx.strokeStyle = "#000000";
                ctx.fillStyle = "#000000";
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


                ctx.fillStyle = "#00000033"
                nyq0 = -this.fs / scale * 0.5 + canvas.width * 0.5;
                nyq = this.fs / scale;
                ctx.beginPath();
                ctx.rect(nyq0, 0, nyq, canvas.height);
                ctx.fill();
                
                ctx.fillStyle = "#000000";

                ctx.beginPath();
                ctx.strokeStyle = "#666666";
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

                ctx.strokeStyle = "#6666ff";
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
                
                ctx.strokeStyle = "#ff6666";
                ctx.fillStyle = "#ff6666";

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
                    
                ctx.strokeStyle = "#000000aa";
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

                ctx2.strokeStyle = "#000000";
                ctx2.fillStyle = "#000000";
                ctx2.clearRect(0, 0, canvas.width, canvas.height);

                // Axes
                ctx2.beginPath();
                ctx2.moveTo(0, canvas2.height * zeroff);
                ctx2.lineTo(canvas2.width, canvas2.height * zeroff);
                ctx2.stroke();

                const tscale = 0.0005; // s / pixel


                ctx2.strokeStyle = "#000000aa";

                ctx2.beginPath();
                ctx2.moveTo(0, 0);

                for(var x = 0; x < canvas2.width; x++)
                {
                    var t = x * tscale;
                    var or = (Math.cos(2.0 * Math.PI * this.f0 * t) + 1.0) * 0.5;
                    ctx2.lineTo(x, canvas2.height * zeroff - or * 100.0);
                }
                ctx2.stroke();

                ctx2.strokeStyle = "#0000ffff";

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

</script>

