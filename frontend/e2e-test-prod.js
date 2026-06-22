import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'https://nackxyz.pages.dev';

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

// Help click choices in Dev Persona by checking for the exact question number circle in the DOM
async function clickDevPersonaChoice(page, questionNum) {
  await page.waitForFunction((num) => {
    const spans = Array.from(document.querySelectorAll('span'));
    const numSpan = spans.find(s => s.textContent === String(num));
    if (!numSpan) return false;
    
    const buttons = Array.from(document.querySelectorAll('button')).filter(b => {
      const isSystemButton = 
        b.textContent.includes('Find Your Vibe') || 
        b.textContent.includes('DEV PERSONA');
      const isBlocked = b.disabled || b.style.pointerEvents === 'none';
      return b.textContent && !isSystemButton && !isBlocked;
    });

    return buttons.length > 0;
  }, { timeout: 8000 }, questionNum);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(b => {
      const isSystemButton = 
        b.textContent.includes('Find Your Vibe') || 
        b.textContent.includes('DEV PERSONA');
      const isBlocked = b.disabled || b.style.pointerEvents === 'none';
      return b.textContent && !isSystemButton && !isBlocked;
    });
    if (buttons.length > 0) {
      buttons[0].click();
    }
  });
}

// Help click choices in Audit by waiting for the correct "Case File 0X" label to appear in DOM
async function clickAuditChoice(page, caseNum) {
  const caseLabel = `Case File ${String(caseNum).padStart(2, '0')}`;
  
  console.log(`[E2E] Waiting for choice buttons for ${caseLabel}...`);
  try {
    await page.waitForFunction((label) => {
      const bodyText = document.body.innerText.toLowerCase();
      if (!bodyText.includes(label.toLowerCase())) return false;

      const buttons = Array.from(document.querySelectorAll('button')).filter(b => {
        const isSystem = b.textContent.includes('เริ่มพิสูจน์') || b.textContent.includes('กลับหน้าหลัก') || b.textContent.includes('เริ่มการสอบสวน');
        const isBlocked = b.disabled || b.getAttribute('data-blocked') === 'true' || b.getAttribute('aria-disabled') === 'true';
        return b.textContent && !isSystem && !isBlocked;
      });

      return buttons.length > 0;
    }, { timeout: 8000 }, caseLabel);
  } catch (e) {
    const buttonDump = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent,
        disabled: b.disabled,
        dataBlocked: b.getAttribute('data-blocked'),
        ariaDisabled: b.getAttribute('aria-disabled'),
        outerHTML: b.outerHTML.substring(0, 150)
      }));
    });
    console.log(`[E2E DEBUG] Timed out waiting for ${caseLabel} choices. Buttons found:`, JSON.stringify(buttonDump, null, 2));
    throw e;
  }

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(b => {
      const isSystem = b.textContent.includes('เริ่มพิสูจน์') || b.textContent.includes('กลับหน้าหลัก') || b.textContent.includes('เริ่มการสอบสวน');
      const isBlocked = b.disabled || b.getAttribute('data-blocked') === 'true' || b.getAttribute('aria-disabled') === 'true';
      return b.textContent && !isSystem && !isBlocked;
    });
    if (buttons.length > 0) {
      buttons[0].click();
    }
  });
}

// Setup common listeners for monitoring logs, errors, and CSP violations
function setupPageListeners(page) {
  const logs = [];
  const errors = [];
  const apiRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[Console][${msg.type()}] ${text}`);
    if (msg.type() === 'error' || text.includes('Content Security Policy') || text.includes('CSP') || text.includes('Refused to')) {
      errors.push(`[Console Error] ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[Page Unhandled Error] ${err.message}`);
  });

  page.on('requestfailed', request => {
    const errorText = request.failure() ? request.failure().errorText : 'unknown';
    if (errorText === 'net::ERR_ABORTED') return;
    errors.push(`[Request Failed] ${request.url()} - ${errorText}`);
  });

  // Enable request interception to log and redirect stale lambda-url calls to the API Gateway
  page.setRequestInterception(true).then(() => {
    page.on('request', req => {
      const url = req.url();
      if (url.includes('/api/') || url.includes('amazonaws.com') || url.includes('on.aws')) {
        apiRequests.push(`➡️ API REQ: ${req.url()} (${req.method()})`);
      }

      if (url.includes('lambda-url.ap-southeast-1.on.aws')) {
        const newUrl = url.replace('fkgvolasgurnlbygsaovbn5pvu0ywodk.lambda-url.ap-southeast-1.on.aws', 'm6751bukx5.execute-api.ap-southeast-1.amazonaws.com');
        req.continue({ url: newUrl });
      } else {
        req.continue();
      }
    });
  });

  page.on('response', async res => {
    if (res.url().includes('/api/') || res.url().includes('amazonaws.com') || res.url().includes('on.aws')) {
      const url = res.url();
      const status = res.status();
      apiRequests.push(`⬅️ API RES: ${url} [${status}]`);
      if (status >= 400) {
        errors.push(`[API Error] ${url} returned status ${status}`);
        try {
          const bodyText = await res.text();
          console.log(`⚠️ Failed API Response Details - URL: ${url}, Status: ${status}, Body: ${bodyText}`);
        } catch (e) {
          console.log(`⚠️ Failed API Response Details - URL: ${url}, Status: ${status}, Could not read body: ${e.message}`);
        }
      }
    }
  });

  return { logs, errors, apiRequests };
}

async function testDevPersona() {
  console.log('🏁 Starting Dev Persona Game PROD E2E Test...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  const monitor = setupPageListeners(page);

  try {
    await page.goto(`${BASE_URL}/dev-persona`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000); // Wait for bundle hydration to fully settle
    console.log('✓ Dev Persona landing page loaded (localStorage cleared & hydrated).');

    await page.waitForSelector('button');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.textContent.includes('Find Your Vibe'));
      if (startBtn) startBtn.click();
      else buttons[0].click();
    });
    console.log('✓ Clicked "Find Your Vibe".');

    // Answer 8 questions
    for (let i = 1; i <= 8; i++) {
      console.log(`  - Answering question ${i}/8...`);
      await clickDevPersonaChoice(page, i);
      await delay(1000);
    }

    console.log('✓ Answered all questions. Waiting for result screen...');
    
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('DEV PERSONA CARD') || text.includes('Rarity') || text.includes('Retake Quiz') || text.includes('Vibe ของคุณคือ');
    }, { timeout: 12000 });

    console.log('✅ Dev Persona PROD Test PASSED successfully!');
  } catch (err) {
    console.error('❌ Error during Dev Persona PROD E2E:', err);
    await page.screenshot({ path: './screenshots/dev-persona-prod-error.png' });
    console.log('Page body text on error:\n', await page.evaluate(() => document.body.innerText));
  } finally {
    console.log('\n--- Dev Persona PROD Network Requests ---');
    console.log(monitor.apiRequests.join('\n'));
    console.log('\n--- Dev Persona PROD Errors/Warnings Detected ---');
    if (monitor.errors.length > 0) {
      console.log(monitor.errors.join('\n'));
    } else {
      console.log('No console errors or failed requests!');
    }
    console.log('------------------------------------\n');
    await browser.close();
    
    if (monitor.errors.length > 0) {
      throw new Error(`Dev Persona E2E failed with ${monitor.errors.length} errors.`);
    }
  }
}

async function testSoulDrink() {
  console.log('\n🏁 Starting Soul Drink Game PROD E2E Test...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  const monitor = setupPageListeners(page);

  try {
    await page.goto(`${BASE_URL}/soul-drink`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000); // Wait for hydration
    console.log('✓ Soul Drink landing page loaded (localStorage cleared & hydrated).');

    await page.waitForSelector('button');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.textContent.includes('เริ่มค้นหาเลย'));
      if (startBtn) startBtn.click();
      else buttons[0].click();
    });
    console.log('✓ Clicked "เริ่มค้นหาเลย ✨".');

    // Answer 8 questions
    for (let i = 1; i <= 8; i++) {
      console.log(`  - Answering question ${i}/8...`);
      await delay(1200);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button')).filter(b => 
          b.textContent && 
          !b.textContent.includes('เริ่มค้นหาเลย') && 
          !b.textContent.includes('กลับหน้าหลัก') &&
          !b.disabled && 
          b.style.pointerEvents !== 'none'
        );
        if (buttons.length > 0) {
          buttons[0].click();
        }
      });
    }

    console.log('✓ Answered all questions. Waiting for result...');
    
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('VIBE:') || text.includes('Rarity Score') || text.includes('เริ่มใหม่') || text.includes('บันทึกรูปภาพ') || text.includes('คุณได้เมนู');
    }, { timeout: 10000 });

    console.log('✅ Soul Drink PROD Test PASSED successfully!');
  } catch (err) {
    console.error('❌ Error during Soul Drink PROD E2E:', err);
    await page.screenshot({ path: './screenshots/soul-drink-prod-error.png' });
    console.log('Page body text on error:\n', await page.evaluate(() => document.body.innerText));
  } finally {
    console.log('\n--- Soul Drink PROD Network Requests ---');
    console.log(monitor.apiRequests.join('\n'));
    console.log('\n--- Soul Drink PROD Errors/Warnings Detected ---');
    if (monitor.errors.length > 0) {
      console.log(monitor.errors.join('\n'));
    } else {
      console.log('No console errors or failed requests!');
    }
    console.log('-----------------------------------\n');
    await browser.close();

    if (monitor.errors.length > 0) {
      throw new Error(`Soul Drink E2E failed with ${monitor.errors.length} errors.`);
    }
  }
}

async function testAudit() {
  console.log('\n🏁 Starting Self-Deception Audit Game PROD E2E Test...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  const monitor = setupPageListeners(page);

  try {
    await page.goto(`${BASE_URL}/audit`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000); // Wait for hydration
    console.log('✓ Audit landing page loaded (localStorage cleared & hydrated).');

    await page.waitForSelector('button');
    
    const clickedStart = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.textContent.includes('เริ่มการสอบสวน'));
      if (startBtn) {
        startBtn.click();
        return true;
      }
      return false;
    });
    
    if (!clickedStart) {
      throw new Error('Failed to find start button with "เริ่มการสอบสวน"');
    }
    console.log('✓ Clicked start button ("เริ่มการสอบสวน").');

    // Answer 8 cases
    for (let i = 1; i <= 8; i++) {
      console.log(`  - Playing Case ${i}/8...`);

      const showingMicroRoast = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('วิเคราะห์ความขัดแย้งย่อย') || text.includes('รับทราบข้อหา') || text.includes('อ่านคดีถัดไป') || text.includes('ดำเนินการต่อ') || text.includes('ระบบตรวจพบ') || text.includes('สู้ต่อ');
      });

      if (showingMicroRoast) {
        console.log('    [Micro Roast Modal Detected] Clicking confirm...');
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const confirmBtn = buttons.find(b => b.textContent.includes('รับทราบ') || b.textContent.includes('อ่านคดี') || b.textContent.includes('ดำเนินการต่อ') || b.textContent.includes('ตกลง') || b.textContent.includes('สู้ต่อ'));
          if (confirmBtn) confirmBtn.click();
          else buttons[0].click();
        });
        await delay(1500);
      }

      await clickAuditChoice(page, i);
      await delay(1000);
    }

    await delay(1500);
    const finalConfirm = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('วิเคราะห์ความขัดแย้งย่อย') || text.includes('รับทราบข้อหา') || text.includes('คำพิพากษา') || text.includes('อ่านคำพิพากษา') || text.includes('ดำเนินการต่อ');
    });

    if (finalConfirm) {
      console.log('    [Final Micro Roast/Verdict Transition] Clicking confirm...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.includes('อ่านคำพิพากษา') || b.textContent.includes('รับทราบ') || b.textContent.includes('ดำเนินการต่อ'));
        if (confirmBtn) confirmBtn.click();
      });
    }

    console.log('✓ Completed cases. Waiting for API verdict calculation...');
    
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Verdict Declared') || text.includes('คำพิพากษา') || text.includes('Verdict') || text.includes('ระดับการหลอกตัวเอง');
    }, { timeout: 15000 });

    console.log('✅ Audit PROD Test PASSED successfully!');
  } catch (err) {
    console.error('❌ Error during Audit PROD E2E:', err);
    await page.screenshot({ path: './screenshots/audit-prod-error.png' });
    console.log('Page body text on error:\n', await page.evaluate(() => document.body.innerText));
  } finally {
    console.log('\n--- Audit PROD Network Requests ---');
    console.log(monitor.apiRequests.join('\n'));
    console.log('\n--- Audit PROD Errors/Warnings Detected ---');
    if (monitor.errors.length > 0) {
      console.log(monitor.errors.join('\n'));
    } else {
      console.log('No console errors or failed requests!');
    }
    console.log('------------------------------\n');
    await browser.close();

    if (monitor.errors.length > 0) {
      throw new Error(`Audit E2E failed with ${monitor.errors.length} errors.`);
    }
  }
}

async function runAll() {
  console.log('🚀 === RUNNING E2E TESTS ON PRODUCTION SERVER === 🚀');
  let hasErrors = false;
  
  try {
    await testDevPersona();
  } catch (e) {
    console.error(e.message);
    hasErrors = true;
  }
  
  try {
    await testSoulDrink();
  } catch (e) {
    console.error(e.message);
    hasErrors = true;
  }
  
  try {
    await testAudit();
  } catch (e) {
    console.error(e.message);
    hasErrors = true;
  }

  if (hasErrors) {
    console.error('🚀 === SOME TESTS FAILED === 🚀');
    process.exit(1);
  } else {
    console.log('🚀 === ALL TESTS COMPLETED SUCCESSFULLY WITH NO ERRORS === 🚀');
    process.exit(0);
  }
}

runAll();
