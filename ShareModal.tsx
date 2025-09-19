import React, { useState, useMemo } from 'react';
import { Survey } from '../types';

interface ShareModalProps {
    survey: Survey;
    onClose: () => void;
}

const appsScriptCode = `
const SHEET_NAME = "Survey Responses";

function doPost(e) {
  try {
    const { survey, response } = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = survey.questions.map(q => q.title);
      headers.unshift("Timestamp");
      sheet.appendRow(headers);
    }
    
    const rowData = survey.questions.map(q => {
      const answer = response[q.id];
      if (answer === undefined || answer === null) return "";
      if (Array.isArray(answer)) return JSON.stringify(answer);
      return String(answer);
    });
    
    rowData.unshift(new Date());
    
    sheet.appendRow(rowData);

    // Required for 'no-cors' mode to work from browser
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }));
  }
}
`.trim();

const ShareModal: React.FC<ShareModalProps> = ({ survey, onClose }) => {
    const [webAppUrl, setWebAppUrl] = useState(localStorage.getItem('webAppUrl') || '');
    const [copied, setCopied] = useState(false);

    const handleSaveUrl = () => {
        localStorage.setItem('webAppUrl', webAppUrl);
        alert('URL đã được lưu!');
    };

    const shareableLink = useMemo(() => {
        if (!webAppUrl) return '';
        const surveyData = btoa(encodeURIComponent(JSON.stringify(survey)));
        const endpoint = btoa(webAppUrl);
        return `${window.location.origin}${window.location.pathname}?survey=${surveyData}&endpoint=${endpoint}`;
    }, [survey, webAppUrl]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-800">Chia sẻ và Thu thập Dữ liệu</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Bước 1: Kết nối với Google Sheets (Chỉ cần làm một lần)</h3>
                        <p className="text-sm text-gray-600 mb-4">Để tự động lưu câu trả lời vào Google Sheet, hãy tạo một Web App bằng Google Apps Script.</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                            <li>Truy cập <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">script.google.com</a> và tạo một dự án mới.</li>
                            <li>Xóa mã mặc định và dán đoạn mã dưới đây vào trình soạn thảo:</li>
                        </ol>
                        <div className="relative my-2">
                            <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto"><code>{appsScriptCode}</code></pre>
                            <button onClick={() => handleCopy(appsScriptCode)} className="absolute top-2 right-2 px-2 py-1 bg-gray-300 text-xs rounded hover:bg-gray-400">Sao chép</button>
                        </div>
                         <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600" start={3}>
                            <li>Nhấp vào <b className="text-gray-800">"Deploy"</b> {'>'} <b className="text-gray-800">"New deployment"</b>.</li>
                            <li>Chọn loại là <b className="text-gray-800">"Web app"</b>.</li>
                            <li>Trong phần <b className="text-gray-800">"Who has access"</b>, chọn <b className="text-gray-800">"Anyone"</b>.</li>
                            <li>Nhấp <b className="text-gray-800">"Deploy"</b> và cấp quyền truy cập cho tài khoản Google của bạn.</li>
                            <li>Sao chép <b className="text-gray-800">"Web app URL"</b> được cung cấp và dán vào ô dưới đây.</li>
                        </ol>
                        <div className="mt-4 flex gap-2">
                            <input
                                type="url"
                                placeholder="Dán Web app URL của bạn ở đây"
                                value={webAppUrl}
                                onChange={e => setWebAppUrl(e.target.value)}
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                            />
                            <button onClick={handleSaveUrl} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">Lưu URL</button>
                        </div>
                    </div>
                    {webAppUrl && (
                         <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bước 2: Chia sẻ Liên kết Khảo sát</h3>
                             <p className="text-sm text-gray-600 mb-4">Gửi liên kết này cho mọi người để họ điền vào biểu mẫu. Các câu trả lời sẽ được tự động lưu vào Google Sheet của bạn.</p>
                            <div className="flex gap-2">
                                <input type="text" readOnly value={shareableLink} className="flex-grow p-2 border bg-gray-50 rounded-md"/>
                                <button onClick={() => handleCopy(shareableLink)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                                    {copied ? 'Đã sao chép!' : 'Sao chép Link'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
