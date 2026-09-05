import { BpmnDesigner } from '@xbeeant/flow-designer';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const savedXml = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://flowable.org/test">
  <bpmn:process id="Process_1" name="流程1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="开始">
      <bpmn:outgoing>Flow_1up21en</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Activity_08vx9uv">
      <bpmn:incoming>Flow_1up21en</bpmn:incoming>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_1up21en" sourceRef="StartEvent_1" targetRef="Activity_08vx9uv" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="179" y="202" width="36" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_08vx9uv_di" bpmnElement="Activity_08vx9uv">
        <dc:Bounds x="347" y="137" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1up21en_di" bpmnElement="Flow_1up21en">
        <di:waypoint x="215" y="177" />
        <di:waypoint x="347" y="177" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className='flex items-center justify-center h-screen'>
        <div className='w-full h-full border border-gray-200'>
          <BpmnDesigner
            forms={{
              parentFormKey: '2079378178966974464',
              search: {
                url: '/forms/api/form/published?&systemId=1773622345393520640&appid=1651560229570498560&k=',
                option: {
                  label: 'name',
                  value: 'formVersionId',
                },
              },
              detail: (v: string) => {
                return `/forms/api/form/schema?formId=${v}&appid=1651560229570498560`;
              },
              onSave: async (schema) => {
                console.log(schema);
                return '2079378178966974464';
              },
            }}
            value={savedXml} // 传入初始 BPMN XML（可选，不传则使用默认空白流程）
            onSave={(xml) => {
              // 点击保存按钮时触发，xml 为当前流程图数据
              console.log('[bpmn]', xml); // 存储到上层组件状态
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
