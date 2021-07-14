import Select from "react-select";
import { updateColumn, removeColumn } from "../redux/actions";
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { knownTypes } from "../api/eventuallie";
import ReactModal from 'react-modal';

const AdvancedTypeModal = (props) => {
  const { defs, close } = props;
  const [ types, setTypes ] = useState(new Set(defs?.eventTypes || []));

  return (
    <>
    <div className="typeModal">
    {knownTypes.map((t) => {
      return (
        <div key={t.value} className="typeCheckbox">
        <input
          id={`type${t.value}`}
          type="checkbox"
          checked={types.has(t.value)}
          onChange={() => {
            if (types.has(t.value)) {
              types.delete(t.value);
            } else {
              types.add(t.value);
            }
            setTypes(new Set(types));
          }}
        />
        <label htmlFor={`type${t.value}`}>{`${t.value}: ${t.desc}`}</label>
        </div>
      );
    })}
    </div>
    <button onClick={() => close(types)}>{"Save & Close"}</button>
    <button onClick={() => setTypes(new Set())}>Clear</button>
    </>
  );
};

const TypeSelect = (props) => {
  const { colId, defs } = props;
  const [ expandAdvanced, setExpandAdvanced ] = useState(false);
  const closeAdvanced = (types) => {
    setExpandAdvanced(false);
    updateColumn(colId, {
      eventTypes: [...types]
    });
  };

  const [ category, setCategory ] = useState(new Set(defs?.categories || []));
  useEffect(() => {
    updateColumn(colId, {
      categories: [...category]
    });
  }, [category, colId]);

  const categoryOptions = [
    {label: "Plays", value: 0},
    {label: "Changes", value: 1},
    {label: "Special", value: 2},
    {label: "Outcomes", value: 3}
  ];

  return (
    <div>
      <div className="categorySelect">
        <div className="categoryOption">
          <input
            id="cat_all"
            type="checkbox"
            checked={category.size === 0}
            onChange={() => {
              if (category.size !== 0) {
                setCategory(new Set());
              }
            }}
          />
          <label htmlFor="cat_all">All</label>
        </div>
        {categoryOptions.map((o) => {
          return (
            <div key={o.value} className="categoryOption">
              <input
                id={`cat${o.value}`}
                type="checkbox"
                checked={category.has(o.value)}
                onChange={() => {
                  if (category.has(o.value)) {
                    category.delete(o.value);
                  } else {
                    category.add(o.value);
                  }
                  if (category.size === categoryOptions.length) {
                    category.clear();
                  }
                  setCategory(new Set(category));
                }}
              />
              <label htmlFor={`cat${o.value}`}>{o.label}</label>
            </div>
          );
        })}
      </div>
      <button onClick={() => setExpandAdvanced(!expandAdvanced)}>{"Advanced >>"}</button>
      <ReactModal isOpen={expandAdvanced}>
        <AdvancedTypeModal defs={defs} close={closeAdvanced} />
      </ReactModal>
      {defs?.eventTypes && <div className="selectedTypes">
        {knownTypes.filter((t) => defs.eventTypes.includes(t.value)).map((t) => {
          return (<div key={t.value} className="selectedTypeCrumb">{t.value}: {t.desc}</div>);
        })}
      </div>}
    </div>
  );
};

const FilterSelect = (props) => {
  const teamOptions = useSelector((state) => state.teamOptions);
  const playerOptions = useSelector((state) => state.playerOptions);
  const defs = useSelector((state) => state.columnDefs.find((c) => {
    return c.key === props.id;
  }));

  const [expand, setExpand] = useState(props.expand || defs?.title === undefined ? true : false);
  const [removeConfirm, setRemoveConfirm] = useState(false)

  const beingOptions = [
    {label: "Monitor", value: 1},
    {label: "Coin", value: 2},
    {label: "Reader", value: 3},
    {label: "Lootcrates", value: 5},
  ];

  const checkTitle = (opt) => {
    if (!opt || defs?.title) {
      return undefined;
    }
    return opt[0].label;
  };

  return (
    <div>
    {!expand && (<button onClick={() => setExpand(true)} className="editButton">edit</button>)}
    {expand && <div>
      {removeConfirm ? (
        <>
        <button onClick={() => setRemoveConfirm(false)} className="removeButton">no</button>
        <button onClick={() => removeColumn(props.id)} className="removeButton">yes</button>
        <label className="removeButton">{"Remove column?"}</label>
        </>
      ) : (
        <button onClick={() => setRemoveConfirm(true)} className="removeButton">x</button>
      )}
    </div>}
    {expand ?
      <input
        type="text"
        placeholder={defs?.title || "Title"}
        onBlur={(e) => updateColumn(props.id, {title: e.target.value})}
        className="titleEdit"
      /> :
      <h1>{defs?.title || "New Column"}</h1>
    }
    {expand && (
      <div className="editPanel">
        <TypeSelect colId={props.id} defs={defs} />

        <label>Teams</label>
        <Select
          options={teamOptions}
          defaultValue={defs && teamOptions.filter((t) => defs.teamIds.includes(t.value))}
          isMulti
          onChange={(opt) => {
            updateColumn(props.id, {
              title: checkTitle(opt),
              teamIds: opt.map((o) => o.value)
            })
          }} 
        />

        <label>Players</label>
        <Select
          options={playerOptions}
          defaultValue={defs && playerOptions.filter((p) => defs.playerIds.includes(p.value))}
          isMulti
          onChange={(opt) => {
            updateColumn(props.id, {
              title: checkTitle(opt),
              playerIds: opt.map((o) => o.value)
            })
          }}
        />

        <label>Beings</label>
        <Select
          options={beingOptions}
          defaultValue={defs && beingOptions.filter((b) => defs.beings.includes(b.value))}
          isMulti
          onChange={(opt) => {
            updateColumn(props.id, {
              title: checkTitle(opt),
              beings: opt.map((o) => o.value)
            });
          }}
        />
        <div className="editButtons">
          <button onClick={() => setExpand(false)}>save</button>
        </div>
      </div>
    )}
    </div>
  );
};

export default FilterSelect;
