import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Hierarchy } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import TableCellSelection from 'tinymce/core/selection/TableCellSelection';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.selection.TableCellSelectionTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const viewBlock = ViewBlock();

  const cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const cGetCellsFromElement = Chain.mapper(function (viewBlock) {
    return TableCellSelection.getCellsFromElement(Element.fromDom(viewBlock.get()));
  });

  const cGetCellsFromRanges = function (paths) {
    return Chain.mapper(function (viewBlock) {
      const ranges = Arr.map(paths, function (path) {
        const container = Hierarchy.follow(Element.fromDom(viewBlock.get()), path).getOrDie();
        const rng = document.createRange();
        rng.selectNode(container.dom());
        return rng;
      });

      return TableCellSelection.getCellsFromRanges(ranges);
    });
  };

  const cAssertCellContents = function (expectedContents) {
    return Chain.op(function (cells) {
      const actualContents = Arr.map(cells, Html.get);
      Assertions.assertEq('Should be expected cell contents', expectedContents, actualContents);
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Get table cells from fake selection', Chain.asStep(viewBlock, [
      cSetHtml('<table><tbody><tr><td data-mce-selected="1">A</td><td>B</td></tr><tr><td data-mce-selected="1">C</td><td>D</td></tr></tbody></table>'),
      cGetCellsFromElement,
      cAssertCellContents(['A', 'C'])
    ])),
    Logger.t('Get table cells from ranges', Chain.asStep(viewBlock, [
      cSetHtml('<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>'),
      cGetCellsFromRanges([[0, 0, 0, 1], [0, 0, 1, 1]]),
      cAssertCellContents(['B', 'D'])
    ]))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
