import React from 'react';
import { Question, QuestionType } from './types';
import { ShortTextIcon, LongTextIcon, RadioIcon, CheckboxIcon, DropdownIcon, DeleteIcon, TableIcon } from './icons';

interface QuestionEditorProps {
  question: Question;
  updateQuestion: (id: string, updatedQuestion: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
}

const QuestionTypeOption: React.FC<{ type: QuestionType, label: string, icon: React.ReactNode }> = ({ type, label, icon }) => (
    <option value={type} className="flex items-center">
        {label}
    </option>
);

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, updateQuestion, deleteQuestion }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as QuestionType;
    const hasOptions = [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(newType);
    updateQuestion(question.id, { 
      questionType: newType, 
      options: hasOptions && question.options.length === 0 ? ['Lựa chọn 1'] : (hasOptions ? question.options : [])
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    updateQuestion(question.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...question.options, `Lựa chọn ${question.options.length + 1}`];
    updateQuestion(question.id, { options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    updateQuestion(question.id, { options: newOptions });
  };

  const hasOptions = [QuestionType.MULTIPLE_CHOICE, QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(question.questionType);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={question.title}
          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          placeholder="Câu hỏi"
          className="flex-grow p-3 border-b-2 border-gray-200 focus:border-purple-500 outline-none text-lg"
        />
        <div className="relative">
             <select
                value={question.questionType}
                onChange={handleTypeChange}
                className="p-3 border border-gray-300 rounded-md w-full md:w-64 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <QuestionTypeOption type={QuestionType.SHORT_ANSWER} label="Trả lời ngắn" icon={<ShortTextIcon />} />
                <QuestionTypeOption type={QuestionType.PARAGRAPH} label="Đoạn" icon={<LongTextIcon />} />
                <QuestionTypeOption type={QuestionType.MULTIPLE_CHOICE} label="Trắc nghiệm" icon={<RadioIcon />} />
                <QuestionTypeOption type={QuestionType.CHECKBOXES} label="Hộp kiểm" icon={<CheckboxIcon />} />
                <QuestionTypeOption type={QuestionType.DROPDOWN} label="Menu thả xuống" icon={<DropdownIcon />} />
                <QuestionTypeOption type={QuestionType.DYNAMIC_TABLE} label="Bảng động" icon={<TableIcon />} />
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <DropdownIcon />
            </div>
        </div>
      </div>
      <input
        type="text"
        value={question.description || ''}
        onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
        placeholder="Mô tả"
        className="w-full text-gray-600 mt-2 p-2 border-b-2 border-transparent focus:border-purple-500 outline-none"
      />
      <div className="mt-4 pl-1">
        {hasOptions && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full p-2 border-b border-gray-200 focus:border-purple-400 outline-none"
                />
                {question.options.length > 1 && (
                    <button onClick={() => removeOption(index)} className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
              </div>
            ))}
            <button onClick={addOption} className="mt-2 text-purple-600 hover:text-purple-800 font-semibold py-2">
              Thêm lựa chọn
            </button>
          </div>
        )}
         {question.questionType === QuestionType.DYNAMIC_TABLE && question.columns && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border">
            <p className="text-sm font-semibold text-gray-800 mb-2">Các cột của bảng (chỉ đọc):</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {question.columns.map((col, index) => <li key={index} className="text-sm">{col}</li>)}
            </ul>
          </div>
        )}
      </div>
      <hr className="my-4"/>
      <div className="flex justify-end items-center gap-4">
        <label className="flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                checked={question.isRequired} 
                onChange={(e) => updateQuestion(question.id, { isRequired: e.target.checked })}
                className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900">Bắt buộc</span>
        </label>
        <button onClick={() => deleteQuestion(question.id)} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100">
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
};

export default QuestionEditor;
