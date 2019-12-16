window.onload = main;

function main()
{
    const canvas      = document.querySelector("#LyapunovCanvas");
    const seqTextArea = document.querySelector("#LyapunovSequence");
    
    const radioButtonFire    = document.querySelector("#RadioThemeFire");
    const radioButtonElectro = document.querySelector("#RadioThemeElectro");
    const radioButtonClassic = document.querySelector("#RadioThemeClassic");
    const radioButtonSepia   = document.querySelector("#RadioThemeSepia");

    const domainText = document.querySelector("#domain");

    const buttonResetDefault  = document.querySelector("#ResetDefault");
    const buttonResetNegative = document.querySelector("#ResetNegative");

    const gl             = canvas.getContext("webgl2");
    const extFloatTex    = gl.getExtension("EXT_color_buffer_float");
    const extLinFloatTex = gl.getExtension("OES_texture_float_linear");
    if (!gl || !extFloatTex || !extLinFloatTex)
    {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    var redNMSlider = document.querySelector("#redNM");
    var grnNMSlider = document.querySelector("#grnNM"); 
    var bluNMSlider = document.querySelector("#bluNM"); 
    var redNASlider = document.querySelector("#redNA"); 
    var grnNASlider = document.querySelector("#grnNA"); 
    var bluNASlider = document.querySelector("#bluNA"); 
    var redPMSlider = document.querySelector("#redPM");
    var grnPMSlider = document.querySelector("#grnPM"); 
    var bluPMSlider = document.querySelector("#bluPM");
    var redPASlider = document.querySelector("#redPA"); 
    var grnPASlider = document.querySelector("#grnPA"); 
    var bluPASlider = document.querySelector("#bluPA"); 

    redPMSlider.addEventListener('input', function () 
    {
        var sliderVal = redPMSlider.value / 50.0 - 2.0;
        document.querySelector("#redPMText").textContent = sliderVal;
        colorMultiplyPos[0] = sliderVal;
    }, false);

    grnPMSlider.addEventListener('input', function () 
    {
        var sliderVal = grnPMSlider.value / 50.0 - 2.0;
        document.querySelector("#grnPMText").textContent = sliderVal;
        colorMultiplyPos[1] = sliderVal;
    }, false);

    bluPMSlider.addEventListener('input', function () 
    {
        var sliderVal = bluPMSlider.value / 50.0 - 2.0;
        document.querySelector("#bluPMText").textContent = sliderVal;
        colorMultiplyPos[2] = sliderVal;
    }, false);

    redPASlider.addEventListener('input', function () 
    {
        var sliderVal = redPASlider.value / 50.0 - 2.0;
        document.querySelector("#redPAText").textContent = sliderVal;
        colorAddPos[0] = sliderVal;
    }, false);

    grnPASlider.addEventListener('input', function () 
    {
        var sliderVal = grnPASlider.value / 50.0 - 2.0;
        document.querySelector("#grnPAText").textContent = sliderVal;
        colorAddPos[1] = sliderVal;
    }, false);

    bluPASlider.addEventListener('input', function () 
    {
        var sliderVal = bluPASlider.value / 50.0 - 2.0;
        document.querySelector("#bluPAText").textContent = sliderVal;
        colorAddPos[2] = sliderVal;
    }, false);
    
    redNMSlider.addEventListener('input', function () 
    {
        var sliderVal = redNMSlider.value / 50.0 - 2.0;
        document.querySelector("#redNMText").textContent = sliderVal;
        colorMultiplyNeg[0] = sliderVal;
    }, false);

    grnNMSlider.addEventListener('input', function () 
    {
        var sliderVal = grnNMSlider.value / 50.0 - 2.0;
        document.querySelector("#grnNMText").textContent = sliderVal;
        colorMultiplyNeg[1] = sliderVal;
    }, false);

    bluNMSlider.addEventListener('input', function () 
    {
        var sliderVal = bluNMSlider.value / 50.0 - 2.0;
        document.querySelector("#bluNMText").textContent = sliderVal;
        colorMultiplyNeg[2] = sliderVal;
    }, false);

    redNASlider.addEventListener('input', function () 
    {
        var sliderVal = redNASlider.value / 50.0 - 2.0;
        document.querySelector("#redNAText").textContent = sliderVal;
        colorAddNeg[0] = sliderVal;
    }, false);

    grnNASlider.addEventListener('input', function () 
    {
        var sliderVal = grnNASlider.value / 50.0 - 2.0;
        document.querySelector("#grnNAText").textContent = sliderVal;
        colorAddNeg[1] = sliderVal;
    }, false);

    bluNASlider.addEventListener('input', function () 
    {
        var sliderVal = bluNASlider.value / 50.0 - 2.0;
        document.querySelector("#bluNAText").textContent = sliderVal;
        colorAddNeg[2] = sliderVal;
    }, false);
    
    seqTextArea.addEventListener("input", function()
    {
        window.cancelAnimationFrame(currAnimationFrame);

        seqTextArea.value = seqTextArea.value.replace(/[^AaBb]/g, "");
        seqTextArea.value = seqTextArea.value.toUpperCase();

        if(seqTextArea.value !== "" && seqTextArea.value !== seqStr)
        {
            seqStr = seqTextArea.value;

            resetValues();
            currAnimationFrame = window.requestAnimationFrame(mainDraw);
        }
        else
        {
            currAnimationFrame = window.requestAnimationFrame(mainDraw);
        }
    });

    canvas.onwheel = function(event)
    {
        if(modeTranslation || event.ctrlKey)
        {
            return;
        }

        event.preventDefault();

        window.cancelAnimationFrame(currAnimationFrame);

        console.log(event.deltaY);

        spaceScale[0] = spaceScale[0] * Math.pow(1.05, event.deltaY * 0.2);
        spaceScale[1] = spaceScale[1] * Math.pow(1.05, event.deltaY * 0.2);

        domainText.textContent = domainString(); 

        resetValues();
        currAnimationFrame = window.requestAnimationFrame(mainDraw);
    }

    canvas.onmousedown = function(event)
    {
        if(event.button == 0)
        {
            cancelAnimationFrame(currAnimationFrame);
            modeTranslation = true;
        }
    }

    canvas.onmousemove = function(event)
    {
        if(modeTranslation && event.buttons & 1 != 0)
        {
            var rangeX = spaceScale[0] * (4.0 - 0.0);
            var rangeY = spaceScale[1] * (4.0 - 0.0);

            spaceTranslate[0] -= 0.2 * rangeX * event.movementX / standardWidth;
            spaceTranslate[1] += 0.2 * rangeY * event.movementY / standardHeight;

            domainText.textContent = domainString(); 
        }
    }

    window.onmouseup = function(event)
    {
        if(modeTranslation && event.button == 0)
        {
            resetValues();
            currAnimationFrame = window.requestAnimationFrame(mainDraw);
            modeTranslation = false;
        }
    }

    buttonResetDefault.onmouseup = function()
    {
        cancelAnimationFrame(currAnimationFrame);

        spaceScale     = [2.0,  2.0]; //[-1, 1] -> [-2, 2]
        spaceTranslate = [2.0,  2.0]; //[-2, 2] -> [ 0, 4]; 

        domainText.textContent = domainString();

        resetValues();
        currAnimationFrame = window.requestAnimationFrame(mainDraw);
        modeTranslation = false;
    }

    buttonResetNegative.onmouseup = function()
    {
        cancelAnimationFrame(currAnimationFrame);

        spaceScale     = [ 1.0,  1.0]; //[-1, 1] -> [-1, 1]
        spaceTranslate = [-1.0, -1.0]; //[-1, 1] -> [-2, 0]; 

        domainText.textContent = domainString();

        resetValues();
        currAnimationFrame = window.requestAnimationFrame(mainDraw);
        modeTranslation = false;
    }

    radioButtonFire.onclick    = defaultTheme;
    radioButtonElectro.onclick = electroTheme;
    radioButtonClassic.onclick = classicTheme;
    radioButtonSepia.onclick   = sepiaTheme;

    var seqStr   = seqTextArea.value;
    var seqIndex = 0;

    var modeTranslation    = false;
    var currAnimationFrame = 0;

    var spaceScale     = [2.0,  2.0]; //[-1, 1] -> [-2, 2]
    var spaceTranslate = [2.0,  2.0]; //[-2, 2] -> [ 0, 4]; 

    var colorMultiplyNeg = [-1.0, -1.0, -1.0,  1.0];
    var colorAddNeg      = [ 0.0,  0.0,  0.0,  0.0];
    var colorMultiplyPos = [ 1.0,  1.0,  1.0,  1.0];
    var colorAddPos      = [ 0.0,  0.0,  0.0,  0.0];

    const standardWidth  = canvas.clientWidth;
    const standardHeight = canvas.clientHeight;
    const textureWidth   = standardWidth  * 2;
    const textureHeight  = standardHeight * 2;

    var resetShaderProgram    = null;
    var lyapunovShaderProgram = null;
    var finalShaderProgram    = null;
    var staticShaderProgram   = null;

    var lyapunovPrevXTextureLocation      = null;
    var lyapunovPrevLambdaTextureLocation = null;
    var finalLambdaTextureLocation        = null;

    var lyapunovIndexUniformLocation = null;
    var lyapunovSnUniformLocation    = null;
    var resetSnUniformLocation       = null;

    var resetScaleSpaceUniformLocation     = null;
    var resetTranslateSpaceUniformLocation = null;

    var lyapunovScaleSpaceUniformLocation     = null;
    var lyapunovTranslateSpaceUniformLocation = null;

    var colorMultiplyNegUniformLocation = null;
    var colorAddNegUniformLocation      = null;
    var colorMultiplyPosUniformLocation = null;
    var colorAddPosUniformLocation      = null;

    //var relativeTranslateUniformLocation = null;

    var xLambdaFrameBuffer = null;

    var xTex1      = null;
    var xTex2      = null;
    var lambdaTex1 = null;
    var lambdaTex2 = null;

    var resetVertexBuffer    = null;
    var lyapunovVertexBuffer = null;
    var finalVertexBuffer    = null;

    defaultTheme();

    createShaders();
    createTextures();
    createBuffers();

    resetValues();
    mainDraw();

    function createTextures()
    {
        xTex1 = gl.createTexture();
        xTex2 = gl.createTexture();
        lambdaTex1 = gl.createTexture();
        lambdaTex2 = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, xTex1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, xTex2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, lambdaTex2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);

        xLambdaFrameBuffer = gl.createFramebuffer();
    }

    function createShaders()
    {
        const vsLyapunovSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=1) in mediump vec2 vScreenAB;
        layout(location=2) in mediump vec2 vScreenTex;

        out highp vec2 vSpacePosition;
        out highp vec2 vTexCoord;

        uniform highp vec2 gScale;
        uniform highp vec2 gTranslate;

        void main(void) 
        {
            gl_Position    = vScreenPos;
            vSpacePosition = vScreenAB * gScale + gTranslate;
            vTexCoord      = vScreenTex;
        }`;

        const fsLyapunovSource = 
        `#version 300 es 

        uniform uint gSn;
        uniform uint gIndex;
        
        uniform highp sampler2D gPrevX;
        uniform highp sampler2D gPrevLambda;
        
        in highp vec2 vSpacePosition;
        in highp vec2 vTexCoord; 
        
        layout(location=0) out highp float oNextX;
        layout(location=1) out highp float oNextLambda;
        
        void main(void)
        {
            highp float rn;
            if(gSn == 0u)
            {
                rn = vSpacePosition.x;
            }
            else
            {
                rn = vSpacePosition.y;
            }
        
            highp float xn      = texture(gPrevX,      vTexCoord).r;
            highp float lambdan = texture(gPrevLambda, vTexCoord).r;
        
            highp float prevCoeff = float(gIndex - 1u);
            highp float thisCoeff = 1.0f / float(gIndex);

            highp float phase = abs(rn * (1.0f - 2.0f * xn)); 
            phase             = max(phase, 1.0e-36); //To counter log(0) case (if you disable this, you'll see white pixels everywhere)

            oNextX = rn * xn * (1.0f - xn);
            oNextLambda = (prevCoeff * lambdan + log(phase)) * thisCoeff;
        }`;

        const vsFinalSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=1) in mediump vec2 vScreenTex;
            
        out mediump vec2 vTexCoord;
        
        void main(void)
        {
            gl_Position = vScreenPos;	
            vTexCoord   = vScreenTex;
        }`;     
        
        const fsFinalSource = 
        `#version 300 es
	
        uniform highp sampler2D gLambdaTex;
        
        uniform lowp vec4 gColorMultiplyNeg;
        uniform lowp vec4 gColorAddNeg;
        uniform lowp vec4 gColorMultiplyPos;
        uniform lowp vec4 gColorAddPos;
        
        in mediump vec2 vTexCoord;
        
        layout(location = 0) out lowp vec4 colorMain;
        
        void main(void)
        {
            highp float lambda = texture(gLambdaTex, vTexCoord).x;
            lambda = clamp(lambda, -1000000.0f, 1000000.0f);

            highp vec4 baseColor = vec4(lambda, lambda, lambda, 1.0f);
            if(lambda < 0.0f)
            {
                colorMain = baseColor * gColorMultiplyNeg + gColorAddNeg;
            }
            else
            {
                colorMain = baseColor * gColorMultiplyPos + gColorAddPos;
            }           
        }`;

        const vsResetSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=1) in mediump vec2 vScreenAB;
        layout(location=2) in mediump vec2 vScreenTex;
        
        out mediump vec2 vSpacePosition;
        out mediump vec2 vTexCoord;
        
        uniform highp vec2 gScale;
        uniform highp vec2 gTranslate;

        void main(void) 
        {
            gl_Position    = vScreenPos;
            vSpacePosition = vScreenAB * gScale + gTranslate;
            vTexCoord      = vScreenTex;
        }`;
        
        const fsResetSource =
        `#version 300 es 

        uniform uint gSn;
        
        in mediump vec2 vSpacePosition;
        in mediump vec2 vTexCoord; 
        
        layout(location=0) out highp float oNextX;
        layout(location=1) out highp float oLambda;
        
        void main(void)
        {
            //Previuos x is 0.5, previous lambda is 0
        
            highp float rn;
            if(gSn == 0u)
            {
                rn = vSpacePosition.x;
            }
            else
            {
                rn = vSpacePosition.y;
            }
        
            oNextX  = rn * 0.5f * 0.5f;
            oLambda = 0.5f;
        }`;

        const vsStaticSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=2) in mediump vec2 vScreenTex;

        out highp vec2 vSpacePosition;
        out highp vec2 vTexCoord;

        uniform highp vec2 gRelativeTranslate;

        void main(void) 
        {
            gl_Position = vScreenPos;
            vTexCoord   = vScreenTex + gRelativeTranslate;
        }`;

        const fsStaticSource = 
        `#version 300 es
	
        uniform highp sampler2D gLambdaTex;
        
        uniform lowp vec4 gColorMultiply;
        uniform lowp vec4 gColorAdd;
        uniform lowp vec4 gColorAbsMix;
        
        in mediump vec2 vTexCoord;
        
        layout(location = 0) out lowp vec4 colorMain;
        
        void main(void)
        {
            highp float lambda = texture(gLambdaTex, vTexCoord).x;
        
            //To choose between abs(lambda) and lambda as color source
            highp vec4 baseColor = vec4(lambda, lambda, lambda, 1.0f);
            highp vec4 absColor  = abs(baseColor);
            
            lowp vec4 mixColor = mix(baseColor, absColor, gColorAbsMix);
            
            colorMain = mixColor * gColorMultiply + gColorAdd;
        }`;

        var lyapunovVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(lyapunovVS, vsLyapunovSource);
        gl.compileShader(lyapunovVS);

        if (!gl.getShaderParameter(lyapunovVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(lyapunovVS));
        }

        var lyapunovFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(lyapunovFS, fsLyapunovSource);
        gl.compileShader(lyapunovFS);

        if(!gl.getShaderParameter(lyapunovFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(lyapunovFS));
        }

        lyapunovShaderProgram = gl.createProgram();
        gl.attachShader(lyapunovShaderProgram, lyapunovVS);
        gl.attachShader(lyapunovShaderProgram, lyapunovFS);
        gl.linkProgram(lyapunovShaderProgram);

        if (!gl.getProgramParameter(lyapunovShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(lyapunovShaderProgram));
        }

        var finalVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(finalVS, vsFinalSource);
        gl.compileShader(finalVS);

        if (!gl.getShaderParameter(finalVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(finalVS));
        }

        var finalFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(finalFS, fsFinalSource);
        gl.compileShader(finalFS);

        if (!gl.getShaderParameter(finalFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(finalFS));
        }

        finalShaderProgram = gl.createProgram();
        gl.attachShader(finalShaderProgram, finalVS);
        gl.attachShader(finalShaderProgram, finalFS);
        gl.linkProgram(finalShaderProgram);

        if (!gl.getProgramParameter(finalShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(finalShaderProgram));
        }

        var resetVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(resetVS, vsResetSource);
        gl.compileShader(resetVS);

        if (!gl.getShaderParameter(resetVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(resetVS));
        }

        var resetFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(resetFS, fsResetSource);
        gl.compileShader(resetFS);

        if (!gl.getShaderParameter(resetFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(resetFS));
        }

        resetShaderProgram = gl.createProgram();
        gl.attachShader(resetShaderProgram, resetVS);
        gl.attachShader(resetShaderProgram, resetFS);
        gl.linkProgram(resetShaderProgram);

        if (!gl.getProgramParameter(resetShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(resetShaderProgram));
        }

        var staticVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(staticVS, vsStaticSource);
        gl.compileShader(staticVS);

        if(!gl.getShaderParameter(staticVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(staticVS));
        }

        var staticFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(staticFS, fsStaticSource);
        gl.compileShader(staticFS);

        if(!gl.getShaderParameter(staticFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(staticFS));
        }

        staticShaderProgram = gl.createProgram();
        gl.attachShader(staticShaderProgram, staticVS);
        gl.attachShader(staticShaderProgram, staticFS);
        gl.linkProgram(staticShaderProgram);

        if (!gl.getProgramParameter(staticShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(staticShaderProgram));
        }

        lyapunovPrevXTextureLocation      = gl.getUniformLocation(lyapunovShaderProgram, "gPrevX");
        lyapunovPrevLambdaTextureLocation = gl.getUniformLocation(lyapunovShaderProgram, "gPrevLambda");
        finalLambdaTextureLocation        = gl.getUniformLocation(finalShaderProgram,    "gLambdaTex");
    
        lyapunovSnUniformLocation    = gl.getUniformLocation(lyapunovShaderProgram, "gSn");
        lyapunovIndexUniformLocation = gl.getUniformLocation(lyapunovShaderProgram, "gIndex");
        resetSnUniformLocation       = gl.getUniformLocation(resetShaderProgram,    "gSn");

        resetScaleSpaceUniformLocation     = gl.getUniformLocation(resetShaderProgram, "gScale");
        resetTranslateSpaceUniformLocation = gl.getUniformLocation(resetShaderProgram, "gTranslate");

        lyapunovScaleSpaceUniformLocation     = gl.getUniformLocation(lyapunovShaderProgram, "gScale");
        lyapunovTranslateSpaceUniformLocation = gl.getUniformLocation(lyapunovShaderProgram, "gTranslate");

        colorMultiplyNegUniformLocation = gl.getUniformLocation(finalShaderProgram, "gColorMultiplyNeg");
        colorAddNegUniformLocation      = gl.getUniformLocation(finalShaderProgram, "gColorAddNeg");
        colorMultiplyPosUniformLocation = gl.getUniformLocation(finalShaderProgram, "gColorMultiplyPos");
        colorAddPosUniformLocation      = gl.getUniformLocation(finalShaderProgram, "gColorAddPos");

        //relativeTranslateUniformLocation = gl.getUniformLocation(staticShaderProgram, "gRelativeTranslate");
    }

    function createBuffers()
    {
        const posArray = new Float32Array([-1.0, -1.0,  0.0,  1.0,
                                            1.0, -1.0,  0.0,  1.0,
                                           -1.0,  1.0,  0.0,  1.0,
                                            1.0,  1.0,  0.0,  1.0]);

        const abArray = new Float32Array([-1.0, -1.0,
                                           1.0, -1.0,
                                          -1.0,  1.0,
                                           1.0,  1.0]);

        const texArray = new Float32Array([0.0, 0.0,
                                           1.0, 0.0,
                                           0.0, 1.0,
                                           1.0, 1.0]);

        var attrib = 0;
        lyapunovVertexBuffer = gl.createVertexArray();
        gl.bindVertexArray(lyapunovVertexBuffer);

        attrib = gl.getAttribLocation(lyapunovShaderProgram, "vScreenPos");
        gl.enableVertexAttribArray(attrib);
        var posLyapunovBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posLyapunovBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(lyapunovShaderProgram, "vScreenAB");
        gl.enableVertexAttribArray(attrib);
        var abLyapunovBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, abLyapunovBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, abArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(lyapunovShaderProgram, "vScreenTex");
        gl.enableVertexAttribArray(attrib);
        var texLyapunovBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texLyapunovBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        finalVertexBuffer = gl.createVertexArray();
        gl.bindVertexArray(finalVertexBuffer);

        attrib = gl.getAttribLocation(finalShaderProgram, "vScreenPos");
        gl.enableVertexAttribArray(attrib);
        var posFinalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posFinalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(finalShaderProgram, "vScreenTex");
        gl.enableVertexAttribArray(attrib);
        var texFinalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texFinalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        resetVertexBuffer = gl.createVertexArray();
        gl.bindVertexArray(resetVertexBuffer);

        attrib = gl.getAttribLocation(resetShaderProgram, "vScreenPos");
        gl.enableVertexAttribArray(attrib);
        var posResetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posResetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(resetShaderProgram, "vScreenAB");
        gl.enableVertexAttribArray(attrib);
        var abResetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, abResetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, abArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(resetShaderProgram, "vScreenTex");
        gl.enableVertexAttribArray(attrib);
        var texResetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texResetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
    }

    function resetValues()
    {
        seqIndex = 0;

        gl.viewport(0, 0, textureWidth, textureHeight);
        gl.bindVertexArray(resetVertexBuffer);

        gl.useProgram(resetShaderProgram);

        gl.bindFramebuffer(gl.FRAMEBUFFER, xLambdaFrameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, xTex2,      0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, lambdaTex2, 0);

        gl.uniform1ui(resetSnUniformLocation, seqStr[seqIndex] === 'A' ? 0 : 1);

        gl.uniform2fv(resetScaleSpaceUniformLocation,     spaceScale);
        gl.uniform2fv(resetTranslateSpaceUniformLocation, spaceTranslate);

        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        seqIndex += 1;
        swapBuffers();
    }

    function mainDraw()
    {
        var strIndex = seqIndex % seqStr.length;

        gl.viewport(0, 0, textureWidth, textureHeight);
        gl.bindVertexArray(lyapunovVertexBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, xLambdaFrameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, xTex2,      0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, lambdaTex2, 0);

        gl.useProgram(lyapunovShaderProgram);

        gl.uniform1ui(lyapunovSnUniformLocation, seqStr[strIndex] === 'A' ? 0 : 1);
        gl.uniform1ui(lyapunovIndexUniformLocation, seqIndex + 1);

        gl.uniform2fv(lyapunovScaleSpaceUniformLocation,     spaceScale);
        gl.uniform2fv(lyapunovTranslateSpaceUniformLocation, spaceTranslate);

        gl.uniform1i(lyapunovPrevXTextureLocation,      0);
        gl.uniform1i(lyapunovPrevLambdaTextureLocation, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, xTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        swapBuffers();

        gl.useProgram(finalShaderProgram);

        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, standardWidth, standardHeight);
        gl.bindVertexArray(finalVertexBuffer);

        gl.uniform1i(finalLambdaTextureLocation, 0);

        gl.uniform4fv(colorMultiplyNegUniformLocation, colorMultiplyNeg);
        gl.uniform4fv(colorAddNegUniformLocation,      colorAddNeg);
        gl.uniform4fv(colorMultiplyPosUniformLocation, colorMultiplyPos);
        gl.uniform4fv(colorAddPosUniformLocation,      colorAddPos);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.drawBuffers([gl.BACK]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        seqIndex           = seqIndex + 1;
        currAnimationFrame = window.requestAnimationFrame(mainDraw);
    }

    /*
    function staticDraw()
    {
        gl.useProgram(staticShaderProgram);

        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, standardWidth, standardHeight);
        gl.bindVertexArray(finalVertexBuffer);

        gl.uniform1i(finalLambdaTextureLocation, 0);

        gl.uniform4fv(colorMultiplyUniformLocation, colorMultiply);
        gl.uniform4fv(colorAddUniformLocation,      colorAdd);
        gl.uniform4fv(colorAbsMixUniformLocation,   colorAbsMix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.drawBuffers([gl.BACK]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }*/

    //=================================================== Theme functions ===================================================\\

    function defaultTheme()
    {
        colorMultiplyNeg = [-1.0, -1.0, -1.0,  1.0];
        colorAddNeg      = [ 0.0, -1.0, -2.0,  0.0];
        colorMultiplyPos = [ 1.0,  1.0,  1.0,  1.0];
        colorAddPos      = [ 0.0, -1.0, -2.0,  0.0];

        updateSliders();
    }

    function electroTheme()
    {
        colorMultiplyNeg = [-0.5, -0.1, -1.0,  1.0];
        colorAddNeg      = [ 0.0,  0.0,  0.0,  0.0];
        colorMultiplyPos = [ 0.5,  0.1,  1.0,  1.0];
        colorAddPos      = [ 0.0,  0.0,  0.0,  0.0];

        updateSliders();
    }

    function classicTheme()
    {
        colorMultiplyNeg = [ 0.25,  0.25,  0.00,  1.00];
        colorAddNeg      = [ 1.00,  1.00,  0.00,  0.00];
        colorMultiplyPos = [ 0.00,  0.00,  2.00,  1.00];
        colorAddPos      = [ 0.00,  0.00,  0.00,  0.00];

        updateSliders();
    }

    function sepiaTheme()
    {
        colorMultiplyNeg = [ 0.22,  0.18,  0.70, 1.0];
        colorAddNeg      = [ 0.74,  0.58,  0.41, 0.0];
        colorMultiplyPos = [ 0.22,  0.18,  0.70, 1.0];
        colorAddPos      = [ 0.28,  0.26,  0.25, 0.0];

        updateSliders();
    }

    function updateSliders()
    {
        redPMSlider.value = (colorMultiplyPos[0] + 2.0) * 50;
        grnPMSlider.value = (colorMultiplyPos[1] + 2.0) * 50;
        bluPMSlider.value = (colorMultiplyPos[2] + 2.0) * 50;
        redPASlider.value = (colorAddPos[0]      + 2.0) * 50;
        grnPASlider.value = (colorAddPos[1]      + 2.0) * 50;
        bluPASlider.value = (colorAddPos[2]      + 2.0) * 50;
        redNMSlider.value = (colorMultiplyNeg[0] + 2.0) * 50;
        grnNMSlider.value = (colorMultiplyNeg[1] + 2.0) * 50;
        bluNMSlider.value = (colorMultiplyNeg[2] + 2.0) * 50;
        redNASlider.value = (colorAddNeg[0]      + 2.0) * 50;
        grnNASlider.value = (colorAddNeg[1]      + 2.0) * 50;
        bluNASlider.value = (colorAddNeg[2]      + 2.0) * 50;

        document.querySelector("#redPMText").textContent = colorMultiplyPos[0];
        document.querySelector("#grnPMText").textContent = colorMultiplyPos[1];
        document.querySelector("#bluPMText").textContent = colorMultiplyPos[2];
        document.querySelector("#redPAText").textContent = colorAddPos[0];
        document.querySelector("#grnPAText").textContent = colorAddPos[1];
        document.querySelector("#bluPAText").textContent = colorAddPos[2];
        document.querySelector("#redNMText").textContent = colorMultiplyNeg[0];
        document.querySelector("#grnNMText").textContent = colorMultiplyNeg[1];
        document.querySelector("#bluNMText").textContent = colorMultiplyNeg[2];
        document.querySelector("#redNAText").textContent = colorAddNeg[0];
        document.querySelector("#grnNAText").textContent = colorAddNeg[1];
        document.querySelector("#bluNAText").textContent = colorAddNeg[2];
    }

    //=================================================== Util functions ===================================================\\
    function swapBuffers()
    {
        var tmp = null;

        tmp = xTex1;
        xTex1 = xTex2;
        xTex2 = tmp;

        tmp = lambdaTex1;
        lambdaTex1 = lambdaTex2;
        lambdaTex2 = tmp;
    }

    function domainString()
    {
        var leftX   = (-1.0 * spaceScale[0] + spaceTranslate[0]).toFixed(2);
        var rightX  = ( 1.0 * spaceScale[0] + spaceTranslate[0]).toFixed(2);
        var bottomY = (-1.0 * spaceScale[1] + spaceTranslate[1]).toFixed(2);
        var topY    = ( 1.0 * spaceScale[1] + spaceTranslate[1]).toFixed(2);

        var leftStr   = String(leftX);
        var rightStr  = String(rightX);
        var bottomStr = String(bottomY);
        var topStr    = String(topY);

        if(leftStr[0] != "-")
        {
            leftStr = " " + leftStr; //Leading spacebar to pad negative minus
        }

        if(rightStr[0] != "-")
        {
            rightStr = " " + rightStr; //Leading spacebar to pad negative minus
        }

        if(bottomStr[0] != "-")
        {
            bottomStr = " " + bottomStr; //Leading spacebar to pad negative minus
        }

        if(topStr[0] != "-")
        {
            topStr = " " + topStr; //Leading spacebar to pad negative minus
        }

        return "[" + leftStr + "," + bottomStr + "] x [" + rightStr + "," + topStr + "]";
    }
}