import React from 'react';
import { Survey, SurveyResponse } from './types';

// Fix: Define the missing ResponsesViewerProps interface.
interface ResponsesViewerProps {
    survey: Survey;
    responses: SurveyResponse[];
}

const ResponsesViewer: React.FC<ResponsesViewerProps> = ({ survey, responses }) => {
    
    const renderAnswer = (answer: any): React.ReactNode => {
        if (!answer) return '';

        if (Array.isArray(answer)) {
            // Check for dynamic table response
            if (answer.length > 0 && typeof answer[0] === 'object' && answer[0] !== null) {
                return (
                    <ul className="list-disc list-inside space-y-2">
                        {answer.map((row, index) => (
                            <li key={index} className="text-xs">
                                <span className="font-semibold">Dòng {index + 1}:</span>
                                <ul className="list-inside pl-4">
                                    {Object.entries(row).map(([key, value]) => (
                                        <li key={key}>{key}: {String(value)}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                );
            }
            // Checkbox response
            return answer.join(', ');
        }
        return String(answer);
    };
    
    const downloadCSV = () => {
        if (responses.length === 0) return;

        const headers = survey.questions.map(q => q.title);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

        responses.forEach(response => {
            const row = survey.questions.map(q => {
                const answer = response[q.id];
                let cellValue = '';
                if (answer) {
                    if (Array.isArray(answer)) {
                        if (answer.length > 0 && typeof answer[0] === 'object' && answer[0] !== null) {
                            // Serialize table data as JSON string
                            cellValue = `"${JSON.stringify(answer).replace(/"/g, '""')}"`;
                        } else {
                            // Checkbox data
                            cellValue = `"${answer.join(', ')}"`;
                        }
                    } else {
                        // Other data types
                        cellValue = `"${String(answer).replace(/"/g, '""')}"`;
                    }
                }
                return cellValue;
            });
            csvContent += row.join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const fileName = survey.title.replace(/\s/g, '_') || 'survey_responses';
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Câu trả lời</h2>
                        <p className="text-gray-600">{responses.length} phản hồi</p>
                    </div>
                    <button 
                        onClick={downloadCSV}
                        disabled={responses.length === 0}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Tải xuống CSV
                    </button>
                </div>
                {responses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {survey.questions.map(q => (
                                        <th key={q.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {q.title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {responses.map((response, index) => (
                                    <tr key={index}>
                                        {survey.questions.map(q => (
                                            <td key={q.id} className="px-6 py-4 whitespace-normal text-sm text-gray-700 align-top">
                                                {renderAnswer(response[q.id])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có câu trả lời nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponsesViewer;