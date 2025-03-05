
module.exports = (sequelize, DataTypes) => {
    const Nick = sequelize.define("nick", {
        idx: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true, 
        },
        nickname: { 
            type: DataTypes.STRING,
            allowNull: false,
        },
        nodeid: { 
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: { 
            type: DataTypes.STRING,
            allowNull: false,
        },
    },{
        timestamps: true, 
        createdAt: true,
        updatedAt: false, 
        tableName:"nick",
        freezeTableName : true,
    });
    return Nick;
};