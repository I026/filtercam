const body = document.getElementById('body');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureButton = document.getElementById('captureButton');
let errorText;

// カメラ映像を取得
async function startCamera(facing) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facing } }
    });
        video.srcObject = stream;
    } catch (error) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
            video.srcObject = stream;
        } catch (error) {
            
            console.error('カメラの起動に失敗しました:', error);
            alert("カメラが存在しないようです｡");
            errorText = "CammeraNot";
            
        }
    }
}

// 二値化処理
function applyGrayscaleLevels() {
    // キャンバスのサイズをビデオと一致させる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // ビデオのフレームをキャンバスに描画
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 描画した画像データを取得
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const levels = [0, 128, 255];

    for (let i = 0; i < data.length; i += 4) {
        // 明るさを計算（加重平均を使用）
        const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // 最も近い階調を選択
        let closestLevel = levels[0];
        let minDifference = Math.abs(brightness - levels[0]);
        for (let level of levels) {
        const difference = Math.abs(brightness - level);
        if (difference < minDifference) {
            closestLevel = level;
            minDifference = difference;
        }
        }

        // ピクセルに適用
        data[i] = closestLevel;     // 赤
        data[i + 1] = closestLevel; // 緑
        data[i + 2] = closestLevel; // 青
    }

    // 処理結果をキャンバスに描画
    ctx.putImageData(imageData, 0, 0);
    };

// イベントリスナー
setInterval(() => {
    applyGrayscaleLevels();
}, 20);

// カメラを起動
startCamera("environment");

body.addEventListener('click', () => {
    // Canvasの内容をデータURLに変換
    const dataURL = canvas.toDataURL('image/jpeg');

    // 現在の時刻を取得
    const now = new Date();

    // 各種情報を取得
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 月は0から始まるので+1
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // フォーマットして表示
    const formattedDate = (`${year}-${month}-${date}_${hours}${minutes}${seconds}`);


    // ダウンロード用のリンクを作成
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = formattedDate; // 保存するファイル名

    if (!(errorText == "CammeraNot")) {
    // リンクをクリックしてダウンロードを実行
    link.click();
    };
});

const swipeArea = document.getElementById('body');
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    // タッチ開始時
    swipeArea.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isSwiping = true;
    });

    // タッチ移動時
    swipeArea.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;

      // 縦方向の動きが大きい場合はスワイプとして処理しない
      if (Math.abs(diffY) > Math.abs(diffX)) {
        isSwiping = false;
      }
    });

    // タッチ終了時
    swipeArea.addEventListener('touchend', (e) => {
      if (!isSwiping) return;

      const touch = e.changedTouches[0];
      const diffX = touch.clientX - startX;

      if (diffX > 50) {
        startCamera("environment");
      } else if (diffX < -50) {
        startCamera("front");
      }

      isSwiping = false;
});