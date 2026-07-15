export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">合规声明</h4>
            <p className="leading-relaxed">
              本平台所展示的产品信息和数据仅供投资者参考，不构成任何投资建议。投资有风险，入市需谨慎。历史业绩不代表未来表现。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">数据安全</h4>
            <p className="leading-relaxed">
              平台采用HTTPS加密传输，内部资料采用权限分级管理和访问日志记录，敏感文件下载自动添加账号水印。
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">联系方式</h4>
            <p className="leading-relaxed">
              如有问题或建议，请联系产品运营团队
              <br />
              邮箱：product@htsc.com
              <br />
              更新时间：2026-07-15
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © 2026 华泰证券资产管理部. 版权所有.
        </div>
      </div>
    </footer>
  );
}
