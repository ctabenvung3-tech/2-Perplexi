import React, { useState } from 'react';
import { Survey, Question, QuestionType, SurveyResponse, SurveyResponseValue } from '../types';

interface DynamicTableInputProps {
    question: Question;
    value: Record<string, string>[];
    onChange: (value: Record<string, string>[]) => void;
    disabled: boolean;
}

const DynamicTableInput: React.FC<DynamicTableInputProps> = ({ question, value, onChange, disabled }) => {
    const { columns = [], isRequired } = question;
    const rows = value && value.length > 0 ? value : [{}];

    const addRow = () => {
        onChange([...rows, {}]);
    };

    const removeRow = (index: number) => {
        if (rows.length > 1) {
            const newRows = rows.filter((_, i) => i !== index);
            onChange(newRows);
        } else {
            onChange([{}]);
        }
    };

    const updateCell = (rowIndex: number, columnName: string, cellValue: string) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [columnName]: cellValue };
        onChange(newRows);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map(col => (
                            <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                        ))}
                        <th className="w-12"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map(col => (
                                <td key={col} className="px-2 py-1">
                                    <input
                                        type="text"
                                        value={row[col] || ''}
                                        onChange={e => updateCell(rowIndex, col, e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none disabled:bg-gray-100"
                                        required={isRequired && rowIndex === 0}
                                        disabled={disabled}
                                    />
                                </td>
                            ))}
                            <td className="px-2 py-1 text-center">
                                <button
                                    type="button"
                                    onClick={() => removeRow(rowIndex)}
                                    className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                                    aria-label="Remove Row"
                                    disabled={disabled}
                                >
                                    &times;
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                type="button"
                onClick={addRow}
                className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-md hover:bg-purple-200 disabled:bg-gray-200"
                disabled={disabled}
            >
                + Thêm dòng
            </button>
        </div>
    );
};


interface FormViewerProps {
    survey: Survey;
    onSubmit: (response: SurveyResponse) => void;
    webAppUrl?: string; // URL for direct submission
    isFillMode?: boolean; // True if loaded from a shareable link
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

const FormViewer: React.FC<FormViewerProps> = ({ survey, onSubmit, webAppUrl, isFillMode }) => {
    const [responses, setResponses] = useState<SurveyResponse>({});
    const [status, setStatus] = useState<SubmissionStatus>('idle');

    const handleValueChange = (questionId: string, value: SurveyResponseValue) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        const currentAnswers = (responses[questionId] as string[] || []);
        const newAnswers = checked
            ? [...currentAnswers, option]
            : currentAnswers.filter(ans => ans !== option);
        handleValueChange(questionId, newAnswers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (webAppUrl && isFillMode) {
            setStatus('submitting');
            try {
                const payload = {
                    survey,
                    response: responses,
                };
                
                const res = await fetch(webAppUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Apps Script requires no-cors for simple POSTs
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                // Since it's no-cors, we can't read the response. We assume success if no network error.
                setStatus('success');

            } catch (error) {
                console.error('Submission Error:', error);
                setStatus('error');
            }
        } else {
            onSubmit(responses);
        }
    };
    
    if (status === 'success') {
         return (
            <div className="max-w-4xl mx-auto py-8 px-4 text-center">
                 <div className="bg-white p-8 rounded-lg border-t-8 border-purple-600 shadow-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Cảm ơn bạn!</h2>
                    <p className="text-gray-600 text-lg">Câu trả lời của bạn đã được ghi nhận.</p>
                </div>
            </div>
        );
    }

    const renderQuestion = (question: Question) => {
        const { id, title, description, questionType, options, isRequired } = question;
        const requiredLabel = isRequired ? <span className="text-red-500 ml-1">*</span> : null;
        const isDisabled = status === 'submitting';

        return (
            <div key={id} className="bg-white p-6 rounded-lg border border-gray-200 mb-4">
                <label className="block text-gray-800 text-lg font-medium mb-1">
                    {title} {requiredLabel}
                </label>
                {description && <p className="text-gray-600 text-sm mb-3">{description}</p>}

                {questionType === QuestionType.SHORT_ANSWER && (
                    <input
                        type="text"
                        required={isRequired}
                        onChange={e => handleValueChange(id, e.target.value)}
                        className="w-full p-2 border-b-2 border-gray-300 focus:border-purple-500 outline-none disabled:bg-gray-100"
                        disabled={isDisabled}
                    />
                )}
                {questionType === QuestionType.PARAGRAPH && (
                    <textarea
                        required={isRequired}
                        onChange={e => handleValueChange(id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100"
                        rows={4}
                        disabled={isDisabled}
                    />
                )}
                {questionType === QuestionType.MULTIPLE_CHOICE && (
                    <div className="space-y-2">
                        {options.map(option => (
                            <label key={option} className={`flex items-center p-2 rounded-md ${isDisabled ? '' : 'hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name={id}
                                    value={option}
                                    required={isRequired}
                                    onChange={e => handleValueChange(id, e.target.value)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 disabled:text-gray-400"
                                    disabled={isDisabled}
                                />
                                <span className={`ml-3 ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>{option}</span>
                            </label>
                        ))}
                    </div>
                )}
                {questionType === QuestionType.CHECKBOXES && (
                    <div className="space-y-2">
                        {options.map(option => (
                            <label key={option} className={`flex items-center p-2 rounded-md ${isDisabled ? '' : 'hover:bg-gray-50'}`}>
                                <input
                                    type="checkbox"
                                    value={option}
                                    onChange={e => handleCheckboxChange(id, option, e.target.checked)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:text-gray-400"
                                    disabled={isDisabled}
                                />
                                <span className={`ml-3 ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>{option}</span>
                            </label>
                        ))}
                    </div>
                )}
                {questionType === QuestionType.DROPDOWN && (
                    <select
                        required={isRequired}
                        onChange={e => handleValueChange(id, e.target.value)}
                        defaultValue=""
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100"
                        disabled={isDisabled}
                    >
                        <option value="" disabled>Chọn một lựa chọn</option>
                        {options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                )}
                 {questionType === QuestionType.DYNAMIC_TABLE && (
                    <DynamicTableInput
                        question={question}
                        value={responses[id] as Record<string, string>[] || []}
                        onChange={(value) => handleValueChange(id, value)}
                        disabled={isDisabled}
                    />
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto py-8 px-4">
             <div className="bg-white p-6 rounded-lg border-t-8 border-purple-600 mb-6 shadow-md">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{survey.title}</h1>
                <p className="text-gray-600">{survey.description}</p>
            </div>
            {survey.questions.map(renderQuestion)}
            <div className="flex justify-between items-center mt-6">
                <button 
                    type="submit" 
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:bg-gray-400"
                    disabled={status === 'submitting'}
                >
                    {status === 'submitting' ? 'Đang gửi...' : 'Gửi câu trả lời'}
                </button>
            </div>
             {status === 'error' && <p className="text-red-500 mt-4 text-center">Đã xảy ra lỗi khi gửi. Vui lòng thử lại.</p>}
        </form>
    );
};

export default FormViewer;