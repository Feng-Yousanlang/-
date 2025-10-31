// 标签切换登录方式
const tabPwd = document.getElementById('tab-pwd');
const tabMail = document.getElementById('tab-mail');
const formPwd = document.getElementById('form-pwd');
const formMail = document.getElementById('form-mail');

tabPwd.onclick = function() {
    tabPwd.classList.add('active');
    tabMail.classList.remove('active');
    formPwd.style.display = '';
    formMail.style.display = 'none';
}
tabMail.onclick = function() {
    tabMail.classList.add('active');
    tabPwd.classList.remove('active');
    formMail.style.display = '';
    formPwd.style.display = 'none';
}

// 验证码/人机校验图刷新（这里只做演示）
function refreshCaptcha() {
    document.getElementById('captcha-img').innerText = '刷新成功';
    setTimeout(()=>{
      document.getElementById('captcha-img').innerText = '点击刷新';
    }, 900);
}
document.getElementById('captcha-img').onclick = refreshCaptcha;

// 账号密码登录表单提交
formPwd.onsubmit = async function(e) {
    e.preventDefault();
    const data = {
        username: formPwd.username.value.trim(),
        password: formPwd.password.value.trim(),
        verification: formPwd.verification.value.trim()
    };
    if (!data.username || !data.password || !data.verification) {
        setMsg('pwd', '请填写全部信息');
        return;
    }
    try {
        const res = await fetch('/api/auth/login/pwd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        showLoginResult('pwd', json);
    } catch (err) {
        setMsg('pwd', '网络错误！');
    }
}

// 邮箱验证码登录提交
formMail.onsubmit = async function(e) {
    e.preventDefault();
    const data = {
        email: formMail.email.value.trim(),
        verification: formMail['mail-verification'].value.trim()
    };
    if (!data.email || !data.verification) {
        setMsg('mail', '请填写全部信息');
        return;
    }
    try {
        const res = await fetch('/api/auth/login/mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        showLoginResult('mail', json);
    } catch (err) {
        setMsg('mail', '网络错误！');
    }
}

// 邮箱验证码获取逻辑（带冷却）
const getCodeBtn = document.getElementById('get-code-btn');
let timer = null, sec = 60;
getCodeBtn.onclick = async function() {
    const email = document.getElementById('email').value.trim();
    if (!email) {
        setMsg('mail', '请先输入邮箱');
        return;
    }
    getCodeBtn.disabled = true;
    try {
        const res = await fetch('/api/auth/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const json = await res.json();
        setMsg('mail', json.message || '验证码发送请求已提交');
        if (json.code===200) {
            countDown();
        } else {
            getCodeBtn.disabled = false;
        }
    } catch {
        setMsg('mail', '发送失败'); getCodeBtn.disabled = false;
    }
};
function countDown() {
    sec = 60;
    getCodeBtn.textContent = sec + 's后重试';
    timer = setInterval(() => {
        sec--;
        getCodeBtn.textContent = sec + 's后重试';
        if (sec <= 0) {
            clearInterval(timer);
            getCodeBtn.textContent = '获取验证码';
            getCodeBtn.disabled = false;
        }
    }, 1000);
}

// 登录结果展示和消息提示
function showLoginResult(type, json) {
    if(type==='pwd') setMsg('pwd', json.message || '未知错误');
    if(type==='mail') setMsg('mail', json.message || '未知错误');
    if(json.code===200 && json.token) {
        setTimeout(()=>{
            alert('登录成功！\nToken：'+json.token);
        }, 300);
    }
}
function setMsg(type, msg) {
    document.getElementById(type==='pwd'? 'msg-pwd': 'msg-mail').textContent = msg||'';
}
